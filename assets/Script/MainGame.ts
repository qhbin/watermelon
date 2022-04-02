
import { _decorator, Component, Node, SpriteFrame, Label, Prefab, instantiate, Sprite, Vec3, Tween, EventTouch, UITransform, PhysicsSystem2D, EPhysics2DDrawFlags, Vec2, RigidBody2D, CircleCollider2D, ERigidBody2DType, director, Director } from 'cc';
import Tools from './Tools';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = MainGame
 * DateTime = Thu Mar 31 2022 12:16:44 GMT+0800 (中国标准时间)
 * Author = binbin_2333
 * FileBasename = MainGame.ts
 * FileBasenameNoExtension = MainGame
 * URL = db://assets/Script/MainGame.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

@ccclass('MainGame')
export class MainGame extends Component {
  // 水果精灵图列表
  @property([SpriteFrame])
  fruitSprites: Array<SpriteFrame> = [];

  // 分数label标签
  @property(Label)
  scoreLabel: Label = null

  // 水果预制节点资源
  @property(Prefab)
  fruitPre: Prefab = null;

  // 顶部区域节点，生成的水果要添加到这个节点里面
  @property(Node)
  topNode: Node = null;

  @property(Node)
  fruitNode: Node = null;

  //用来暂存生成的水果节点
  targetFruit: Node = null;
  
  //已创建水果计数
  createFruitCount: number = 0;

  //分数变动和结果
  scoreObj = {
    isScoreChanged: false,
    target: 0,
    change: 0,
    score: 0,
  };

  //设置一个静态单例引用，方便其他类中调用该类方法
  static Instance: MainGame = null;

  onLoad() {
    null != MainGame.Instance && MainGame.Instance.destroy();
    MainGame.Instance = this;

    this.physicsSystemCtrl(true, false);
    director.on(Director.EVENT_AFTER_PHYSICS, function () {
    })
  }

  update(dt) {
    this.updateScoreLabel(dt);
  }

  start() {
    this.createOneFruit(0);
    this.bindTouch();
  }

  //#region 分数面板更新
  setScoreTween(score: number) {
    let scoreObj = this.scoreObj;
    scoreObj.target != score &&
      ((scoreObj.target = score),
        (scoreObj.change = Math.abs(scoreObj.target - scoreObj.score)),
        (scoreObj.isScoreChanged = !0));
  }

  updateScoreLabel(dt) {
    let scoreObj = this.scoreObj;
    if (scoreObj.isScoreChanged) {
      (scoreObj.score += dt * scoreObj.change * 5),
        scoreObj.score >= scoreObj.target &&
        ((scoreObj.score = scoreObj.target), (scoreObj.isScoreChanged = !1));
      var t = Math.floor(scoreObj.score);
      this.scoreLabel.string = t.toString();
    }
  }


  /**
 * 创建一个升级的水果
 * @param fruitNumber number 水果编号
 * @param position Vec3 水果位置
 */
  createLevelUpFruit = function (fruitNumber: number, position: Vec3) {
    let _this = this;
    let fruit = instantiate(this.fruitPre);
    fruit.parent = _this.fruitNode;
    fruit.getComponent(Sprite).spriteFrame = _this.fruitSprites[fruitNumber];
    const fruitObj: { [key: string]: any } = fruit.getComponent("Fruit");
    fruitObj.fruitNumber = fruitNumber;
    fruit.setPosition(position);
    fruit.setScale(new Vec3(0, 0));

    fruit.getComponent(RigidBody2D).type = ERigidBody2DType.Dynamic;
    fruit.getComponent(RigidBody2D).linearVelocity = new Vec2(0, -100);
    fruit.getComponent(CircleCollider2D).radius = fruit.height / 2;
    fruit.getComponent(CircleCollider2D).apply();

    new Tween(fruit)
      .to(
        0.5,
        {
          scale: new Vec3(1, 1),
        },
        {
          easing: "backOut",
        }
      )
      .call(function () {
      })
      .start();
  };

  physicsSystemCtrl(enablePhysics: boolean, enableDebug: boolean) {
    PhysicsSystem2D.instance.enable = enablePhysics;
    PhysicsSystem2D.instance.gravity = new Vec2(0, -300);
    if (enableDebug) {
      PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape
    }
    PhysicsSystem2D.instance.enable = enablePhysics;
  }


  // 创建一个水果
  createOneFruit(index: number) {
    const _this = this;
    const fruit = instantiate(this.fruitPre);
    fruit.parent = this.topNode;
    fruit.getComponent(Sprite).spriteFrame = this.fruitSprites[index];
    const fruitObj: { [key: string]: any } = fruit.getComponent("Fruit");
    fruitObj.fruitNumber = index;
    fruit.getComponent(RigidBody2D).type = ERigidBody2DType.Static;
    fruit.getComponent(CircleCollider2D).radius = 0;
    fruit.getComponent(CircleCollider2D).apply();

    // 动画
    fruit.setScale(new Vec3(0, 0));
    new Tween(fruit)
      .to(0.5, {
        scale: new Vec3(1, 1),
      },
        {
          easing: "backOut",
        })
      .call(function () {
        _this.targetFruit = fruit;
      })
      .start();
  }

  // 绑定事件
  bindTouch() {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this),
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this),
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this),
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onTouchStart(e: EventTouch) {
    if (null == this.targetFruit) {
      return;
    }

    let h = this.targetFruit.getComponent(UITransform).height;
    this.targetFruit.getComponent(CircleCollider2D).radius = h / 2;
    this.targetFruit.getComponent(CircleCollider2D).apply();
    this.targetFruit.getComponent(RigidBody2D).type = ERigidBody2DType.Static;
    this.targetFruit.getComponent(RigidBody2D).linearVelocity = new Vec2(0, -800);

    //点击位置的x坐标值赋值给水果
    let x = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(e.getLocation().x)).x,
      y = this.targetFruit.position.y;

    new Tween(this.targetFruit)
      .to(0.1, {
        position: new Vec3(x, y),
      })
      .start();
  }
  onTouchMove(e: EventTouch) {
    if (null == this.targetFruit) {
      return;
    }
    const x = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(e.getLocation().x)).x;
    console.log(456, x);
    this.targetFruit.setPosition(new Vec3(x));
  }
  onTouchEnd(e: EventTouch) {
    let _this = this;
    if (null == _this.targetFruit) {
      return;
    }

    //让水果降落
    let h = this.targetFruit.getComponent(UITransform).height;
    this.targetFruit.getComponent(CircleCollider2D).radius = h / 2;
    this.targetFruit.getComponent(CircleCollider2D).apply();
    this.targetFruit.getComponent(RigidBody2D).type = ERigidBody2DType.Dynamic;
    this.targetFruit.getComponent(RigidBody2D).linearVelocity = new Vec2(0, -800);

    //去掉暂存指向
    _this.targetFruit = null;

    //生成一个新的水果
    this.scheduleOnce(function () {
      0 == _this.createFruitCount
        ? (_this.createOneFruit(0), _this.createFruitCount++)
        : 1 == _this.createFruitCount
          ? (_this.createOneFruit(0), _this.createFruitCount++)
          : 2 == _this.createFruitCount
            ? (_this.createOneFruit(1), _this.createFruitCount++)
            : 3 == _this.createFruitCount
              ? (_this.createOneFruit(2), _this.createFruitCount++)
              : 4 == _this.createFruitCount
                ? (_this.createOneFruit(2), _this.createFruitCount++)
                : 5 == _this.createFruitCount
                  ? (_this.createOneFruit(3), _this.createFruitCount++)
                  : _this.createFruitCount > 5 &&
                  (_this.createOneFruit(Math.floor(Math.random() * 5)),
                    _this.createFruitCount++);
    }, 0.5);
  }
}