// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Config } from "./Config";
import GameScene from "./GameScene";

// 标签
// this._pCC.tag
// 密度
// this._pCC.density
// 摩擦系数[0-1]
// this._pCC.friction
// 弹性系数[0-1]
// this._pCC.restitution
// 圆形半径
// this._pCC.radius

// 刚体类型
// this._rigidBody.type
// 是否开启碰撞事件的监听
// this._rigidBody.enabledContactListener
// 是否为快速移动的物体（子弹属性），禁止（高速穿越）穿过其他快速移动的物体
// this._rigidBody.bullet
// 是否允许进入休眠状态，一段时间后如果物体没有任何状态改变会进入休眠
// this._rigidBody.allowSleep
// 缩放在此刚体上的重力值
// this._rigidBody.gravityScale
// 线性阻尼，衰减线性速度
// this._rigidBody.linearDamping
// 角速度阻尼,衰减角速度
// this._rigidBody.angularDamping
// 刚体在世界坐标下的线性速度
// this._rigidBody.linearVelocity
// 刚体的角速度
// this._rigidBody.angularVelocity
// 是否禁止此刚体进行旋转
// this._rigidBody.fixedRotation
// 是否立刻唤醒此刚体
// this._rigidBody.awake
// 是否激活这个刚体，如果不激活，那么刚体不会参与碰撞
// this._rigidBody.active

interface Property {
    // 半径 精灵
    typeof: number;
};

const {ccclass, property} = cc._decorator;

@ccclass
export default class Role extends cc.Component {
    
    private _pCC : cc.PhysicsCircleCollider = null;
    
    private _rigidBody : cc.RigidBody = null;

    private _property : Property = null;

    start () {
        console.log("start");
        this._pCC = this.node.getComponent(cc.PhysicsCircleCollider);
        this._rigidBody = this.node.getComponent(cc.RigidBody);

        cc.resources.load("fruit/role_" + this._property.typeof, cc.SpriteFrame, (err:any, frame:cc.SpriteFrame) => {
            this.node.getComponent(cc.Sprite).spriteFrame = frame;
            this._rigidBody.type = cc.RigidBodyType.Static;
            this._pCC.radius = 0;
            this._pCC.apply();
        });
    }

    /**
     * 设置物体属性
     */
    setProperty ( obj:Property ) {
        console.log("设置属性");
        this._property = obj;
    }
    getProperty ( ) : Property {
        return this._property;
    }

    /**
     * 切换成运动状态 
     */
    changeDynamic () {
        this._pCC.radius = Config.shhereRadius[this._property.typeof];
        this._rigidBody.type = cc.RigidBodyType.Dynamic;
        this._rigidBody.linearVelocity = Config.shhereVelocity[this._property.typeof];
        this._pCC.apply();
    }

    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact (contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        console.log("selfCollider : ", selfCollider);
        console.log("otherCollider : ", otherCollider);
        if (otherCollider.node.group === "dynamic") {
            if (selfCollider.node.y < otherCollider.node.y) {
                return
            }
            let otherTypeOf = otherCollider.node.getComponent("Role").getProperty().typeof;
            if (otherTypeOf == this._property.typeof && otherTypeOf < 11 && this._property.typeof < 11) {
                console.log("相同类型水果相互碰撞 self : ", this._property.typeof);
                console.log("相同类型水果相互碰撞 otherTypeOf : ", otherTypeOf);
                otherCollider.node.getComponent(cc.PhysicsCircleCollider).radius = 0;
                otherCollider.node.getComponent(cc.PhysicsCircleCollider).apply()
                this._pCC.radius = 0;
                this._pCC.apply();
                GameScene.getInstance().updateScore(Config.shhereScore[otherTypeOf + 1]);
                GameScene.getInstance().composite(otherTypeOf + 1, otherCollider.node.position);
                otherCollider.node.active = false;
                this.node.active = false;
                otherCollider.node.destroy();
                this.node.destroy();
            }
        }
    }

    // 只在两个碰撞体结束接触时被调用一次
    // onEndContact (contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {

    // }

    // 每次将要处理碰撞体接触逻辑时被调用
    // onPreSolve (contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {

    // }

    // 每次处理完碰撞体接触逻辑时被调用
    // onPostSolve (contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {

    // }

}
