
import { _decorator, Component, Vec3, Tween, screen, view  } from 'cc';
import Tools from './Tools';

const { ccclass, property, executionOrder } = _decorator;

/**
 * Predefined variables
 * Name = AdjustWithHeight
 * DateTime = Wed Mar 30 2022 14:45:04 GMT+0800 (中国标准时间)
 * Author = binbin_2333
 * FileBasename = AdjustWithHeight.ts
 * FileBasenameNoExtension = AdjustWithHeight
 * URL = db://assets/Script/AdjustWithHeight.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('AdjustWithHeight')
@executionOrder(1)
export class AdjustWithHeight extends Component {
    @property
    offset:number = 0;

    //是否显示入场动画
    @property
    hasShowEffect:boolean = false;
    
    onLoad () {
        const winSize = Tools.getWinSize();
        let y = winSize.height / 2;
        const position =  this.node.getPosition();
        if(!this.hasShowEffect){
            y += this.offset;
        }
        this.node.setPosition(new Vec3(position.x, y))
    }  

    showTheNode(){ 
        if(this.hasShowEffect){
            const position =  this.node.getPosition();
            new Tween(this.node)
            .to(0.5, { position: new Vec3(position.x, position.y + this.offset) }, { easing: 'bounceInOut' })
            .start();
        }
    }

    start () {
        this.showTheNode(); 
    }
}
