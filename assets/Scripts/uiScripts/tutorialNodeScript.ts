import { _decorator, Canvas, CCFloat, Component, director, find, instantiate, Node, Prefab, Sprite, Tween, tween, UIOpacity } from 'cc';
import { tutorialTextComponent } from './tutorialTextComponent';
import { gridComponent } from '../gameplayBase/gridComponent';
import { canvasLogic } from './canvasLogic';
import { GameEvents, HIDE_TUTOR } from '../gameManager';
const { ccclass, property } = _decorator;

@ccclass('tutorialNodeScript')
export class tutorialNodeScript extends Component {
    
    @property(Node)
    private canvas: Node

    @property(tutorialTextComponent)
    private ctaText: tutorialTextComponent

    @property(Node)
    private card: Node

    @property(Node)
    private hand: Node

    @property(Prefab)
    private tutorialUnitPrefab: Prefab

    @property(CCFloat)
    private handTweenDuration: number = 0.6

    private unit: Node
    
    public switchToMergeTutor() {
        this.ctaText.switchRole()

        const cardOp = this.card.getComponent(UIOpacity)
        tween(cardOp)
            .to(0.3, { opacity: 0 })
            .call(() => {
                if (this.card) {
                    this.card.destroy()
                    this.card = null
                }
            }).start()

        const unitsNodes: Node[] = find("grid").getComponent(gridComponent).returnCellsForMergeTutor()
        
        const instPosUI = this.canvas.getComponent(canvasLogic).camGameplay.convertToUINode(unitsNodes[0].worldPosition, this.canvas)
        const targetPosUI = this.canvas.getComponent(canvasLogic).camGameplay.convertToUINode(unitsNodes[1].worldPosition, this.canvas)
        
        const startPosWorld = unitsNodes[0].worldPosition.clone()
        const targetPosWorld = unitsNodes[1].worldPosition.clone()

        const unitTutor = instantiate(this.tutorialUnitPrefab)
        unitTutor.parent = director.getScene()

        this.unit = unitTutor

        Tween.stopAllByTarget(this.hand)
        Tween.stopAllByTarget(this.unit)

        tween(this.hand)
        .repeatForever(
            tween()
            .call(() => {
                this.hand.setPosition(instPosUI)
                this.unit.setWorldPosition(startPosWorld)
                this.unit.active = true
            })
            .parallel(
                tween(this.hand).to(this.handTweenDuration, { position: targetPosUI }, { easing: "sineInOut" }),
                tween(this.unit).to(this.handTweenDuration, { worldPosition: targetPosWorld }, { easing: "sineInOut" })
            )
            .call(() => {
                this.unit.active = false
            })
            .to(this.handTweenDuration, { position: instPosUI }, { easing: "sineInOut" })
        )
        .start()
    }

    public kill(){
        Tween.stopAllByTarget(this.hand)
        Tween.stopAllByTarget(this.unit)
        this.unit.destroy()
    }
}


