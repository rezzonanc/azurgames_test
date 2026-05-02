import { _decorator, Component, EventTouch, Input, input, Vec2, EventTarget } from 'cc';
const { ccclass } = _decorator;

export const InputEvents = new EventTarget()

export const INPUT_TOUCH_START = "input-touch-start"
export const INPUT_TOUCH_MOVE = "input-touch-move"
export const INPUT_TOUCH_END = "input-touch-end"

@ccclass('inputHandler')
export class inputHandler extends Component {

    private touchState: string = "none"
    private currentTouchPos: Vec2 = new Vec2()

    
    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this)
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this)
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
    }

    private onTouchStart(event: EventTouch) {
        this.touchState = "drag"
        this.currentTouchPos = event.getLocation()
        InputEvents.emit(INPUT_TOUCH_START, this.touchState, this.currentTouchPos)
    }

    private onTouchMove(event: EventTouch) {
        if (this.touchState !== "drag") return;

        this.currentTouchPos = event.getLocation()
        InputEvents.emit(INPUT_TOUCH_MOVE, this.touchState, this.currentTouchPos)
    }

    private onTouchEnd(event: EventTouch) {
        this.currentTouchPos = event.getLocation()
        this.touchState = "none"
        InputEvents.emit(INPUT_TOUCH_END, this.touchState, this.currentTouchPos)
    }
}