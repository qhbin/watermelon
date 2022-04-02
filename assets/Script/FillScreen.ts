
import { _decorator, Component, UITransform, screen } from 'cc';
import Tools from './Tools'
const { ccclass } = _decorator;

/**
 * Predefined variables
 * Name = FillScreen
 * DateTime = Wed Mar 30 2022 12:31:47 GMT+0800 (中国标准时间)
 * Author = binbin_2333
 * FileBasename = FillScreen.ts
 * FileBasenameNoExtension = FillScreen
 * URL = db://assets/Script/FillScreen.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('FillScreen')
export class FillScreen extends Component {

    onLoad() {
        const winSize = Tools.getWinSize();
        const node = this.getComponent(UITransform);
        node.setContentSize(winSize.width, winSize.height);
    }

    start () {
    }
}