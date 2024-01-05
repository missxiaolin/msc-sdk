// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Replace {
  export interface TriggerConsole {
    args: any[]
    level: string
  }
  export interface IRouter {
    to: string
    from: string
    duration?: number
    subType?: string
  }
}
