import CPU from "./CPU";
import PPU from "./PPU";
import ROM from "./ROM";
import APU from "./APU";
import Controller from "./Controller";
import { MODES, OPCODES, INTERRUPTS } from "./constants.js";

import { mergeDeep } from "../utils/Merge";
import Notifier from "../utils/Notifier";
import Throttle from "../utils/Throttle";

/**
 * Main class for the emulator, controls the hardware emulation.
 * Fires up events.
 */
class Console extends Notifier {
  constructor(fps = null) {
    super();
    this.cpu = new CPU();
    this.ppu = new PPU();
    this.apu = new APU();
    this.controller = new Controller();
    this.rom = null;
    this.cycles = 0;
    this.interrupt = null;
    this.quickSaveData = null;

    // CPU, APU, PPU and controller are cross referenced in the code
    this.cpu.connect(
      this.apu,
      this.ppu,
      this.controller
    );
    this.frameReq = null;

    // Output & CPU throttling
    this.frameThrottling = fps ? new Throttle(fps) : null;
    this.nesThrottling = new Throttle(60);

    // Debug variables
    this.frameNbr = 0;
    this.opCodesKeys = Object.keys(OPCODES);
    this.modeKeys = Object.keys(MODES);
  }

  loadROM(data) {
    this.rom = new ROM(data);
    this.ppu.connectROM(this.rom);
    this.reset();
  }

  reset() {
    this.cpu.reset();
    this.ppu.reset();
    this.notifyObservers("nes-reset", this.ppu.frameBuffer);
  }

  quickSave() {
    // Ok so, this is a bit of a mess here
    // Save also bundles the current ROM, and our memory buffers take a lot of place.
    // localStorage has a strict threshold for what you can store.
    // To work around this, Make a clone of the current NES object and empty the memory buffers
    var quickSaveData = JSON.parse(JSON.stringify(this.cpu));

    quickSaveData.ppu.frameBuffer = [];
    quickSaveData.ppu.frameBackgroundBuffer = [];
    quickSaveData.ppu.frameSpriteBuffer = [];
    quickSaveData.ppu.frameColorBuffer = [];
    quickSaveData.ppu.patternTable1 = [];
    quickSaveData.ppu.patternTable2 = [];

    this.notifyObservers("nes-quick-save");
    localStorage.quickSave = JSON.stringify(quickSaveData);
  }

  loadQuickSave(data) {
    if (localStorage.quickSave) {
      this.cpu = mergeDeep(this.cpu, JSON.parse(localStorage.quickSave));
      this.cpu.ppu.resetBuffers();
      this.notifyObservers("nes-load-quick-save");
    }
  }

  start() {
    this._tick = this.tick;
    this.frameReq = requestAnimationFrame(this.frame.bind(this));
  }

  /**
   * Sync mode used in tests
   */
  startSync() {
    let res = 0;

    while (true) {
      if (this.nesThrottling === null || !this.nesThrottling.isThrottled()) {
        while (true) {
          res = this.tick();

          if (res === 1) {
            break;
          } else if (res === -1) {
            this.stop();
            return;
          }
        }
      }
    }
  }

  startDebug() {
    this._tick = this.tickDebug;
    this.frameReq = requestAnimationFrame(this.frame.bind(this));
  }

  stop() {
    cancelAnimationFrame(this.frameReq);
  }

  /**
   *  Same a tick() but with additional notify calls for debug purposes.
   *  Slows down the main loop which is why it needs a separate codepath
   */
  tickDebug() {
    this.cycles = this.cpu.tick();
    this.cycles = this.cycles * 3;

    this.notifyObservers("cpu-tick", [
      this.cpu.instrCode,
      this.opCodesKeys[this.cpu.instrOpCode],
      this.modeKeys[this.cpu.instrMode],
      this.cpu.instrSize,
      this.cpu.instrCycles,
      this.cpu.addr
    ]);

    for (; this.cycles > 0; this.cycles--) {
      this.interrupt = this.ppu.tick();

      if (this.interrupt !== null) {
        if (this.interrupt === INTERRUPTS.NMI) {
          this.cpu.triggerNMI();
        } else if (this.interrupt === INTERRUPTS.IRQ) {
          this.cpu.triggerIRQ();
        }
      }
      // Check when next scanline is done

      this.notifyObservers("ppu-tick");

      if (this.ppu.frameReady) {
        this.notifyObservers("frame-ready", this.ppu.frameBuffer);
        this.notifyObservers("frame-ready-debug");
        this.ppu.acknowledgeFrame();
        this.frameNbr++;
        return false;
      }
    }

    return true;
  }

  tick() {
    this.cycles = this.cpu.tick();

    if (this.cycles === -1) {
      // CPU did nothing, this is our way of knowing the program should exit
      return -1;
    }

    for (let c = this.cycles; c > 0; c--) {
      this.apu.tick();
    }

    for (let c = this.cycles * 3; c > 0; c--) {
      this.interrupt = this.ppu.tick();

      if (this.interrupt !== null) {
        if (this.interrupt === INTERRUPTS.NMI) {
          this.cpu.triggerNMI();
        } else if (this.interrupt === INTERRUPTS.IRQ) {
          this.cpu.triggerIRQ();
        }
      }

      if (this.ppu.frameReady) {
        if (!this.frameThrottling.isThrottled()) {
          this.notifyObservers("frame-ready", [
            this.ppu.frameBuffer,
            this.ppu.frameBackgroundBuffer,
            this.ppu.frameSpriteBuffer,
            this.ppu.frameColorBuffer
          ]);
        }
        this.ppu.acknowledgeFrame();
        return 1;
      }
    }

    return 0;
  }

  frame() {
    let res = 0;

    if (this.nesThrottling === null || !this.nesThrottling.isThrottled()) {
      while (true) {
        res = this._tick();

        if (res === 1) {
          break;
        } else if (res === -1) {
          this.stop();
          return;
        }
      }
    }

    this.frameReq = requestAnimationFrame(this.frame.bind(this));
  }
}

export default Console;
