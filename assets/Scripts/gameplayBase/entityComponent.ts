import { _decorator, CCFloat, CCInteger, Component, Node, SkeletalAnimation } from 'cc'
import { skeletalAnimationController } from '../skeletalAnimationController'
import { GameEvents, GAME_PAUSED, GAME_UNPAUSED } from '../gameManager'
const { ccclass, property } = _decorator

@ccclass('entityComponent')
export class entityComponent extends Component {
    
    @property(CCInteger)
    protected hp: number = 5
    protected maxHp: number

    @property(CCInteger)
    protected damage: number = 5

    @property(CCFloat)
    protected attackRate: number = 1

    protected skel: SkeletalAnimation

    protected paused: boolean = false
    
    protected start(): void {

        this.skel = this.node.getComponentInChildren(SkeletalAnimation)
        this.skel.getComponent(skeletalAnimationController).setup(this.node, this.skel)

        this.node.on("anim-shoot", this.onAnimShoot, this)
        this.node.on("anim-attack-finished", this.onAnimAttack, this)
        this.node.on("anim-death-finished", this.onAnimDeath, this)

        GameEvents.on(GAME_PAUSED, this.pause, this)
        GameEvents.on(GAME_UNPAUSED, this.unpause, this)

        this.maxHp = this.hp

        this.fakeStart()
        
    }

    protected fakeStart(){
        
    }

    public takeDamage(val: number){

        this.hp -= val

        this.uniqueDamageEffect()

        if (this.hp <= 0) {
            this.dead()
        }
    }

    protected uniqueDamageEffect(){}

    protected pause(){ }

    protected unpause(){ }

    protected dead(){}

    protected attack(){}

    protected findEnemy(){}

    protected onAttackFire(){}

    protected onAnimShoot() {
        this.onAttackFire()
    }
    
    protected onAnimAttackEnd() {
    }

    protected onAnimAttack(){
        this.onAnimAttackEnd()
    }

    protected fade(){}

    protected onAnimDeath() {
        this.fade()
    }

    
    
}