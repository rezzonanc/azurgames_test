import { _decorator, Component, Node, tween, UIOpacity, screen, Vec3, view, ResolutionPolicy, isValid, Camera, CCFloat, CCInteger, Vec2, SafeArea, UITransform, Prefab, instantiate, randomRange } from 'cc';
import { buyUnitBtnComponent } from './buyUnitBtnComponent';
import { GameEvents, gameManager, HIDE_TUTOR, SHOW_TUTOR_BUY, SHOW_TUTOR_MERGE } from '../gameManager';
import { tutorialNodeScript } from './tutorialNodeScript';
import { responsiveWidget } from './responsiveWidget';
import { EnemiesEvents, ENEMY_DIED } from '../gameplayBase/enemiesManager';
const { ccclass, property } = _decorator;

@ccclass('canvasLogic')
export class canvasLogic extends Component {
    
    @property(tutorialNodeScript)
    private tutorialNode: tutorialNodeScript

    @property(buyUnitBtnComponent)
    private buyUnitBtn: buyUnitBtnComponent

    @property(UITransform)
    private uiParentTransform: UITransform

    @property([responsiveWidget])
    private nodesToAdaptPosition: responsiveWidget[] = []

    @property(Camera)
    public camGameplay: Camera

    @property(Camera)
    private camForUnits: Camera

    @property(CCInteger)
    private camPortraitFov: number = 70

    @property(CCInteger)
    private camLandscapeFov: number = 55

    @property(Prefab)
    private coinPref: Prefab

    @property(Node)
    private targetNodeForCoins: Node

    private gm: gameManager


    protected onLoad(): void {

        screen.on("window-resize", this.onWindowResize, this)
        this.onWindowResize()

        this.gm = this.node.getComponent(gameManager)
    }

    onWindowResize() {
        const windowSize = screen.windowSize
        const isPortrait = windowSize.height > windowSize.width

        if(isPortrait){
            let diffrence = screen.windowSize.height / screen.windowSize.width
            this.uiParentTransform.width = 1280 / diffrence
            this.uiParentTransform.height = 1280

            this.camGameplay.fov = this.camPortraitFov
            this.camForUnits.fov = this.camPortraitFov
            
        }
        else{
            let diffrence = screen.windowSize.width / screen.windowSize.height
            this.uiParentTransform.width = 1280
            this.uiParentTransform.height = 1280 / diffrence

            this.camGameplay.fov = this.camLandscapeFov
            this.camForUnits.fov = this.camLandscapeFov

        }

        this.nodesToAdaptPosition.forEach(item => {
            if (!isValid(item)) return

            const comp = item.getComponent(responsiveWidget)
            if (comp && comp.node.activeInHierarchy) {
                comp.updateLayout()
            }
        })
    }

    protected start(): void {
        

        GameEvents.on(SHOW_TUTOR_BUY, this.showTutorialBuy, this)
        GameEvents.on(SHOW_TUTOR_MERGE, this.showTutorialMerge, this)
        GameEvents.on(HIDE_TUTOR, this.hideTutor, this)

        EnemiesEvents.on(ENEMY_DIED, this.spawnCoins, this)

        this.onWindowResize()

        this.tutorialNode.node.active = false
        this.buyUnitBtn.visualNode.active = false
        this.buyUnitBtn.button.enabled = false

    }

    showTutorialBuy(){

        this.tutorialNode.node.active = true
        this.buyUnitBtn.visualNode.active = true
        this.buyUnitBtn.button.enabled = true

        this.onWindowResize()

        const opacityValue = { value: 0 }
        const tutorUiOp = this.tutorialNode.getComponent(UIOpacity)
        const btnUiOp = this.buyUnitBtn.getComponent(UIOpacity)

        tween(opacityValue)
        .to(0.4, {value: 255}, {
            onUpdate: () => {
                tutorUiOp.opacity = opacityValue.value
                btnUiOp.opacity = opacityValue.value
            }
        })
        .start()

    }

    showTutorialMerge(){
        
        this.tutorialNode.switchToMergeTutor()
        this.buyUnitBtn.button.enabled = false
        this.buyUnitBtn.visualNode.active = false

        this.camForUnits.node.active = true

        this.onWindowResize()
        
    }

    hideTutor(){

        // this.buyUnitBtn.node.active = true
        this.tutorialNode.kill()
        this.buyUnitBtn.switchRole()

        const opacityValue = { value: 255 }
        const tutorUiOp = this.tutorialNode.getComponent(UIOpacity)

        tween(opacityValue)
        .to(0.4, {value: 0}, {
            onUpdate: () => {
                tutorUiOp.opacity = opacityValue.value
            }
        })
        .call(()=>{
            this.tutorialNode.enabled = false
            this.camForUnits.node.active = false
        })
        .start()
    }

    public spawnCoins(worldPos: Vec3){
        
        for (let i = 0; i < this.gm.addMoneyForKill; i++) {

            const coin = instantiate(this.coinPref)
            coin.parent = this.node
            const uiPos = this.camGameplay.convertToUINode(worldPos, this.node)
            
            coin.setPosition(uiPos)
            
            const spreadPos = uiPos.add(new Vec3(randomRange(-1, 1) * 30, randomRange(-1, 1) * 30, 0))

            tween(coin)
            .to(0.4, {position: spreadPos}, {easing: "sineOut"})
            .call(()=>{
                tween(coin)
                .to(0.5 + randomRange(-1, 1) * 0.15, {worldPosition: this.targetNodeForCoins.worldPosition}, {easing: "sineOut"})
                .call(()=>{
                    this.gm.addToMoney(1)
                    coin.destroy()
                })
                .start()
            })
            .start()
        }
    }
}


