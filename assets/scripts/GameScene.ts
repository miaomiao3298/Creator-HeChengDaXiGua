const {ccclass, property} = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {
    @property(cc.Node)
    heightNode: cc.Node = null;
    @property(cc.Node)
    overSprite: cc.Node = null;
    @property(cc.Prefab)
    rolePrefab: cc.Prefab = null;
    @property(cc.Label)
    scoreLabel: cc.Label = null;

//----------------------------------------------------------------------------------
    public _score: number = 0;
    public static _ins: GameScene = null;

    private _addRoleNode: cc.Node = null;
    private _physicsMgr: cc.PhysicsManager = cc.director.getPhysicsManager();

    static getInstance () : GameScene { 
        return this._ins;
    }

    onLoad () {
       GameScene._ins = this;       
        this._physicsMgr.enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, -320);
        // cc.PhysicsManager.DrawBits.e_aabbBit
        // cc.PhysicsManager.DrawBits.e_pairBit |
        // cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        // cc.PhysicsManager.DrawBits.e_jointBit |
        // cc.PhysicsManager.DrawBits.e_shapeBit
        // cc.director.getPhysicsManager().debugDrawFlags = 0;
        // var draw = cc.PhysicsManager.DrawBits;
        // cc.director.getPhysicsManager().debugDrawFlags = draw.e_shapeBit|draw.e_jointBit;

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    start () {
        console.log(this.node);
    }

    onTouchStart ( touch: cc.Touch ) : boolean {
        console.log("touch x : ", touch.getLocation().x);
        console.log("touch y : ", touch.getLocation().y);
        
        if (!this._addRoleNode) {
            let vec = this.heightNode.convertToNodeSpaceAR(touch.getLocation());
            this.addXiGua(vec.x);
            return true;
        }
        return false;
    }

    onTouchMove ( touch: cc.Touch ) {
        if (!this._addRoleNode)
            return;
        if (this._addRoleNode.getComponent(cc.RigidBody).type !== cc.RigidBodyType.Static)
            return;
        let vec = this.heightNode.convertToNodeSpaceAR(touch.getLocation());
        this._addRoleNode.x = vec.x;
    }

    onTouchEnd ( touch: cc.Touch ) {
        if (!this._addRoleNode)
            return;
        if (this._addRoleNode.getComponent(cc.RigidBody).type !== cc.RigidBodyType.Static)
            return;
        this._addRoleNode.getComponent("Role").changeDynamic();
        this.scheduleOnce(() => {
            this._addRoleNode = null;
       }, 0.1);
    }

    /**
     * 刷新分数
     */
    updateScore ( upScore: number ) {
        this._score += upScore;
        this.scoreLabel.string = "当前分：" + this._score.toString();
    }

    /**
     * 西瓜类型的随机数
     */
    getRandom () : number {
        let min = 1;
        let max = 7;
        let range = max - min;
        let ranValue = min + Math.round(Math.random() * range);
        return ranValue;
    }

    /**
     * 添加西瓜类型
     */
    addXiGua ( x: number ) {
        let n = cc.instantiate(this.rolePrefab);
        this._addRoleNode = n;
        n.getComponent("Role").setProperty({typeof : this.getRandom()});
        n.position = new cc.Vec3(x, this.heightNode.y);
        n.scale = 0;
        this.node.addChild(n);
        cc.tween(n)            
        .to(0.1, { scale: 1 }, { easing: 'backOut' }).start();
    }

    /**
     * 合成西瓜
     */
    composite (typeOf: number, point: cc.Vec3) {
        let n = cc.instantiate(this.rolePrefab);
        n.getComponent("Role").setProperty({typeof : typeOf});
        n.position = point;
        n.scale = 0;
        this.node.addChild(n);
        cc.tween(n)            
        .to(0.01, { scale: 1 }, { easing: 'backOut' }).call((obj:cc.Node) => {
            obj.getComponent("Role").changeDynamic();
        }).start();
    }
}
