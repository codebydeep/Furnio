declare module 'locomotive-scroll' {
  interface LocomotiveScrollOptions {
    el: HTMLElement
    smooth?: boolean
    multiplier?: number
    lerp?: number
    smartphone?: { smooth?: boolean }
    tablet?: { smooth?: boolean; breakpoint?: number }
    getDirection?: boolean
    getSpeed?: boolean
  }

  interface ScrollInstance {
    scroll: { instance: { scroll: { y: number } } }
  }

  type ScrollCallback = (obj: ScrollInstance) => void

  class LocomotiveScroll {
    constructor(options: LocomotiveScrollOptions)
    on(event: 'scroll', cb: ScrollCallback): void
    update(): void
    destroy(): void
    stop(): void
    start(): void
    scrollTo(
      target: string | HTMLElement | number,
      options?: { offset?: number; duration?: number; easing?: [number, number, number, number]; disableLerp?: boolean }
    ): void
  }

  export default LocomotiveScroll
}
