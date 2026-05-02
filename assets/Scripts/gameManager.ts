import { _decorator, CCInteger, Component, EventTarget } from 'cc';
import { gridComponent } from './gameplayBase/gridComponent';
import { EnemiesEvents, ENEMY_DIED } from './gameplayBase/enemiesManager';
import { INPUT_TOUCH_START, InputEvents } from './inputHandler';
import { audioManager } from './audioManager';
const { ccclass, property } = _decorator;

export const GameEvents = new EventTarget()

export const PRICE_UPDATED = "price-updated"
export const BALANCE_UPDATED = "balance-updated"

export const GAME_PAUSED = "game-paused"
export const GAME_UNPAUSED = "game-unpaused"

export const SHOW_TUTOR_BUY = "show-tutor-buy"
export const SHOW_TUTOR_MERGE = "show-tutor-merge"
export const HIDE_TUTOR = "hide-tutor"

@ccclass('gameManager')
export class gameManager extends Component {

    
    @property(CCInteger)
    private money: number = 0

    @property(CCInteger)
    public addMoneyForKill: number = 5

    @property(CCInteger)
    private priceIncreaseAfterBuy: number = 5

    @property(CCInteger)
    private currentBuyPrice: number = 10

    @property(gridComponent)
    private grid: gridComponent
    
    private buyTutorWas: boolean = false
    private mergeTutorWas: boolean = false
    private allTutorPassed: boolean = false

    public static gameIsPaused: boolean = false

    public static redirect: boolean = false

    public buyUnit() {
        if (this.money < this.currentBuyPrice) return

        audioManager.play("buy")

        this.money -= this.currentBuyPrice
        this.currentBuyPrice += this.priceIncreaseAfterBuy

        this.grid.addUnit(true, -1, -1, 1)

        GameEvents.emit(PRICE_UPDATED, this.currentBuyPrice, this.money)
        GameEvents.emit(BALANCE_UPDATED, this.money)

        if(!this.mergeTutorWas){
            this.mergeTutorWas = true
            GameEvents.emit(SHOW_TUTOR_MERGE)
        }
    }

    protected start(): void {

        InputEvents.on(INPUT_TOUCH_START, this.onTap, this)
        
        GameEvents.emit(PRICE_UPDATED, this.currentBuyPrice, this.money)
        GameEvents.emit(BALANCE_UPDATED, this.money)
    }

    public addToMoney(val: number){

        this.money += val

        GameEvents.emit(BALANCE_UPDATED, this.money)

        GameEvents.emit(PRICE_UPDATED, this.currentBuyPrice, this.money)
    }

    protected update(dt: number): void {
        this.storyline()
    }

    storyline(){
        if(!this.buyTutorWas && this.money >= this.currentBuyPrice){
            
            GameEvents.emit(GAME_PAUSED)
            GameEvents.emit(SHOW_TUTOR_BUY)

            this.buyTutorWas = true
            gameManager.gameIsPaused = true
        }
    }

    onTap(){

        if(!this.allTutorPassed && this.mergeTutorWas && this.buyTutorWas && gameManager.gameIsPaused){
            GameEvents.emit(HIDE_TUTOR)
            GameEvents.emit(GAME_UNPAUSED)
            gameManager.gameIsPaused = false
            this.allTutorPassed = true
        }

        if(gameManager.redirect){
            console.log("redirect")
        }
    }


}