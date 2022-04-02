
import { _decorator, screen, view } from 'cc';
const { ccclass } = _decorator;

@ccclass('Tools')
export default class Tools {
  static getWinSize() {
    const { width, height } = view.getVisibleSize()
    return { width, height };
  }
}
