
import { _decorator, Component, Node, SpriteFrame, Label, Prefab, instantiate, Sprite, Vec3, Tween, EventTouch, UITransform, PhysicsSystem2D, EPhysics2DDrawFlags, Vec2, RigidBody2D, CircleCollider2D, ERigidBody2DType, director, Director, math, Color, AudioSource, AudioClip, UIOpacity } from 'cc';
import Tools from './Tools';
import { Fruit } from './Fruit';
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

  //果汁效果图，水果颗粒
  @property([SpriteFrame])
  fruitL: Array<SpriteFrame> = [];

  //果粒散溅
  @property([SpriteFrame])
  guozhiL: Array<SpriteFrame> = [];

  //果汁效果
  @property([SpriteFrame])
  guozhiZ: Array<SpriteFrame> = [];

  //果汁预制资源
  @property(Prefab)
  juicePre: Prefab = null;

  //效果挂载的节点
  @property(Node)
  effectNode: Node = null;

  @property([AudioClip])
  audios: AudioClip[] = [];

  _audioSource: AudioSource = null!;

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

  //全部水果最高高度
  theFruitHeight: number = -1200;

  @property(Node)
  dashLineNode: Node = null;

  isDashLineInit: boolean = false;

  //标记游戏结束
  gameOverSign: number = 0;

  onLoad() {
    null != MainGame.Instance && MainGame.Instance.destroy();
    MainGame.Instance = this;

    this.physicsSystemCtrl(true, false);
    this._audioSource = this.node.getComponent(AudioSource)!;
  }

  update(dt) {
    this.updateScoreLabel(dt);
    this.checkTheRedDashLine(dt);
  }

  start() {
    //初始化红色虚线
    this.initDashLine();
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
    fruit.getComponent(CircleCollider2D).radius = fruit.getComponent(UITransform).height / 2;
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
    _this.findHighestFruit();
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
    let w = this.targetFruit.getComponent(UITransform).width;
    const winWidth = Tools.getWinSize().width;
    this.targetFruit.getComponent(CircleCollider2D).radius = h / 2;
    this.targetFruit.getComponent(CircleCollider2D).apply();
    this.targetFruit.getComponent(RigidBody2D).type = ERigidBody2DType.Static;
    this.targetFruit.getComponent(RigidBody2D).linearVelocity = new Vec2(0, -800);
    //点击位置的x坐标值赋值给水果
    let x = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(e.getLocation().x)).x,
      y = this.targetFruit.position.y;

    const mX = (winWidth - w) / 2;
    x = x > 0 ? Math.min(mX, x) : Math.max(-mX, x);

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

  createFruitBoomEffect(fruitNumber: number, t: Vec3, width: number) {
    let _this = this;

    //播放音效
    _this.playAudio(4, false, 0.3);
    _this.playAudio(1, false, 0.5);

    let n = 10;
    while (n > 0) {
      n--;

      let c = instantiate(_this.juicePre);
      c.parent = _this.effectNode;
      c.getComponent(Sprite).spriteFrame = _this.guozhiL[fruitNumber];
      var a = 359 * Math.random(),
        i = 30 * Math.random() + width / 2;

      const scale = 0.5 * Math.random() + width / 100;
      c.setScale(new Vec3(scale, scale));

      var duration = 0.5 * Math.random();
      c.setPosition(t);
      c.setRotationFromEuler
      const rotation = _this.randomInteger(-360, 360);

      new Tween(c)
        .by(duration, { position: new Vec3(Math.sin((a * Math.PI) / 180) * i, Math.cos((a * Math.PI) / 180) * i) })
        .to(duration + 0.5, { scale: new Vec3(0.3, 0.3) })
        .by(duration + 0.5, { rotation: math.Quat.fromAngleZ(new math.Quat(), rotation) })
        .union()
        .call(() => {
          new Tween(c.getComponent(UIOpacity))
            .to(0.1, { opacity: 0 })
            .call(() => c.active = !1)
            .start()
        })
        .start();
    }


    for (var f = 0; f < 20; f++) {
      let h = instantiate(_this.juicePre);
      h.parent = _this.effectNode;
      h.getComponent(Sprite).spriteFrame = _this.fruitL[fruitNumber];
      h.active = !0;
      const angle = 359 * Math.random();
      const i = 30 * Math.random() + width / 2;
      h.setPosition(t);
      const scale = 0.5 * Math.random() + width / 100;
      h.setScale(new Vec3(scale, scale));
      const duration = 0.5 * Math.random();
      const position = new Vec3(
        Math.sin((angle * Math.PI) / 180) * i,
        Math.cos((angle * Math.PI) / 180) * i
      )

      new Tween(h)
        .by(duration, {
          position
        })
        .to(duration + 0.5, {
          scale: new Vec3(.3, .3)
        })
        .union()
        .call(() => {
          new Tween(h.getComponent(UIOpacity))
            .to(0.1, { opacity: 0 })
            .call(() => h.active = !1)
            .start()
        })
        .start();
    }

    var m = instantiate(_this.juicePre);
    m.parent = _this.effectNode;
    m.active = true;
    m.getComponent(Sprite).spriteFrame = _this.guozhiZ[fruitNumber];
    m.setPosition(t);
    m.setScale(new Vec3(0, 0));
    const angle = this.randomInteger(0, 360);

    m.setRotationFromEuler(new Vec3(0, 0, angle));

    new Tween(m)
      .to(.2, {
        scale: new Vec3(width / 150, width / 150)
      })
      .call(() => {
        m.getComponent(UIOpacity).opacity = 0;
        new Tween(m.getComponent(UIOpacity))
          .to(0.1, { opacity: 255 })
          .call(() => m.active = !1)
          .start()
      })
      .start();
  }

  randomInteger(min, max) {
    const span = Math.ceil(Math.random() * (max - min));
    return min < 0 ? span + min : span;
  }

  playAudio(clipIndex: number, loop: boolean, volume: number) {
    this._audioSource.loop = loop;
    this._audioSource.playOneShot(this.audios[clipIndex], 1);
  }

  /**
 * 查找最高的水果，在碰撞和生成后调用检测
 */
  findHighestFruit() {
    let height = this.theFruitHeight;
    for(let i = 0; i < this.fruitNode.children.length; i++) {
      const currentHeight = this.fruitNode.children[i].getPosition().y + this.fruitNode.children[i].getComponent(UITransform).width / 2;
      height = Math.max(currentHeight, height)
    }
    this.theFruitHeight = height;
  }

  //检测是否快到红线了
  checkTheRedDashLine(dt) {
    if (!this.isDashLineInit) {
      return;
    }
    const y = this.dashLineNode.getPosition().y;
    y - this.theFruitHeight < 100 &&
      y - this.theFruitHeight >= 0 &&
      (this.dashLineNode.active = true);

    y - this.theFruitHeight > 100 &&
      (this.dashLineNode.active = false);
  }

  /**
 * 初始化红线，并加入闪烁效果
 */
  initDashLine() {
    let _this = this;
    new Tween(this.dashLineNode.getComponent(UIOpacity))
      .to(0.3, {
        opacity: 255,
      })
      .to(0.3, {
        opacity: 0,
      })
      .union()
      .repeatForever()
      .start();
    this.scheduleOnce(function () {
      _this.dashLineNode.active = false;
      _this.isDashLineInit = true;
    }, 1);
  }

  /**
   * 游戏结束
   */
  gameOver() {
    var _this = this;
    if (_this.gameOverSign == 0) {
      let t = 0;
      const boomFn = function (n) {
        setTimeout(function () {
          _this.createFruitBoomEffect(
            _this.fruitNode.children[n].getComponent(Fruit).fruitNumber,
            _this.fruitNode.children[n].position,
            _this.fruitNode.children[n].getComponent(UITransform).width
          );

          let score =
            _this.scoreObj.target +
            _this.fruitNode.children[n].getComponent(Fruit).fruitNumber +
            1;
          _this.setScoreTween(score);
          _this.fruitNode.children[n].active = false;
        }, 100 * ++t);
      }

      //游戏结束，水果自爆
      for (let i = this.fruitNode.children.length - 1; i >= 0; i--) {
        boomFn(i);
      }
      _this.dashLineNode.active = true;

      for (var i = 1; i < _this.topNode.children.length; i++) {
        _this.topNode.children[i].active = !1;
      }

      this.scheduleOnce(function () {
        _this.showGameOverPanel();
      }, 3);

      _this.gameOverSign++;
    }
  }

  //游戏结束界面
  @property(Prefab)
  gameOverPre: Prefab = null;
  showGameOverPanel() {
    let _this = this;
    let gameOverPanelNode = instantiate(this.gameOverPre);
    gameOverPanelNode.parent = _this.node;

    gameOverPanelNode
      .getChildByName("startBtn")
      .on(Node.EventType.TOUCH_START, function (e: Event) {
        _this.restartGame();
      });
    let btnNode = gameOverPanelNode.getChildByName("startBtn");

    new Tween(btnNode)
      .to(1, {
        scale: new Vec3(0.8, 0.8),
      })
      .to(1, {
        scale: new Vec3(0.9, 0.9),
      })
      .union()
      .repeatForever()
      .start();

    gameOverPanelNode.children[0].on(
      Node.EventType.TOUCH_START,
      function (e: Event) {
        _this.restartGame();
      }
    );
  }

  restartGame() {
    director
    director.preloadScene("Main", function () {
      director.loadScene("Main");
    });
  }
}