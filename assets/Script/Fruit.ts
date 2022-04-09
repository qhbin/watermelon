
import { _decorator, Component, Tween, CircleCollider2D, RigidBody2D, Collider2D, IPhysics2DContact, Contact2DType, PhysicsGroup, PhysicsSystem2D, EventTarget, BoxCollider2D, Color, UITransform, Sprite, UIOpacity, Vec3 } from 'cc';
import { MainGame } from "./MainGame";

const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Fruit
 * DateTime = Thu Mar 31 2022 11:58:23 GMT+0800 (中国标准时间)
 * Author = binbin_2333
 * FileBasename = Fruit.ts
 * FileBasenameNoExtension = Fruit
 * URL = db://assets/Script/Fruit.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

enum GROUP {
    FRUIT = 1,
    WALL = 2,
    DOWNWALL = 2
}

@ccclass('Fruit')
export class Fruit extends Component {
    //和底部边界的碰撞次数，用来标记第一次碰撞时播放音效
    downWallColl: number = 0;

    //过线停留时间
    checkEndTime: number = 0;

    //已经触发过线的次数，防止一直触发
    endCount: number = 0;

    //水果编号，同时用于索引要显示的水果精灵图片
    fruitNumber = 0;

    onLoad() {
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }
    update(dt) {
        let _this = this;
        if (_this.node.parent.name == "fruitNode") {
            _this.checkEndTime += dt;
          if (
            _this.node.getPosition().y + _this.node.getComponent(UITransform).height / 2 > MainGame.Instance.dashLineNode.getPosition().y &&
            _this.endCount == 0 &&
            _this.checkEndTime > 3
          ) {
            _this.node.getComponent(Sprite).color = Color.RED;

            //过线的水果变红闪
            new Tween(_this.node.getComponent(UIOpacity))
              .to(0.3, {
                opacity: 0,
              })
              .to(0.3, {
                opacity: 255,
              })
              .union()
              .repeat(3)
              .call(function () {
                  //结束游戏
                  MainGame.Instance.gameOver();
              })
              .start();
            _this.endCount++;
          }
        }
      }
    //碰撞开始事件
    onBeginContact(
        self: Collider2D,
        other: Collider2D
    ) {
        let _this = this;
        let fruitNode = MainGame.Instance.fruitNode;

        //是否碰撞到底部边界
        if (other.node.getComponent(RigidBody2D).group === PhysicsGroup.DOWNWALL) {
            //碰撞后将其加入到fruitNode节点下
            self.node.parent = fruitNode;

            //是否第一次碰撞
            if (_this.downWallColl == 0) {
                //播放碰撞音效
                MainGame.Instance.playAudio(0, false, 1);
            }

            _this.downWallColl++;
        }
        //是否碰撞到其他水果
        if (other.node.getComponent(RigidBody2D).group == PhysicsGroup.FRUIT) {
            self.node.parent = fruitNode;

            null != self.node.getComponent(RigidBody2D) &&
                (self.node.getComponent(RigidBody2D).angularVelocity = 0);
            //下面的水果碰撞上面的水果跳过
            if (self.node.getPosition().y < other.node.getPosition().y) {
                return;
            }

            let otherFruitNumber = other.node.getComponent(Fruit).fruitNumber,
                selfFruitNumber = _this.fruitNumber;

            //两个水果编号一样
            if (otherFruitNumber == selfFruitNumber) {
                //两个都已经是西瓜的情况
                if (selfFruitNumber == 10) {
                    return;
                }

                let pos = other.node.getPosition();

                //合并效果，音效，得分，生成一个新的水果
                MainGame.Instance.playAudio(3, false, 1);

                //得分
                let score = MainGame.Instance.scoreObj.target + selfFruitNumber + 1;
                MainGame.Instance.setScoreTween(score);

                //去掉碰撞边界，避免再次碰撞
                other.node.getComponent(CircleCollider2D).radius = 0;
                self.node.getComponent(CircleCollider2D).radius = 0;
                self.node.getComponent(CircleCollider2D).scheduleOnce(() => {
                    self.node.getComponent(CircleCollider2D).apply();
                });
                other.node.getComponent(CircleCollider2D).scheduleOnce(() => {
                    other.node.getComponent(CircleCollider2D).apply()
                });

                new Tween(self.node)
                    .to(0.1, {
                        position: pos, //合成到被碰撞的水果的位置
                    })
                    .call(() => {
                        //创建爆浆效果，果汁飞溅的效果
                        MainGame.Instance.createFruitBoomEffect(
                            selfFruitNumber,
                            pos,
                            self.node.getComponent(UITransform).width
                        );

                        //创建合成的水果
                        setTimeout(() => {
                            MainGame.Instance.createLevelUpFruit(selfFruitNumber + 1, pos);
                        }, 0)
                        //销毁两个碰撞的水果
                        self.node.active = !1;
                        other.node.active = !1;
                        other.node.destroy();
                        self.node.destroy();
                    })
                    .start();
            }
        }
    }


    onDestroy() {
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    clear( self: Collider2D, other: Collider2D) {
        other.node.getComponent(CircleCollider2D).radius = 0;
        self.node.getComponent(CircleCollider2D).radius = 0;
        other.node.getComponent(CircleCollider2D).apply();
        self.node.getComponent(CircleCollider2D).apply();
    }

}