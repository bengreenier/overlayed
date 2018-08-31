declare module 'enpeem' {
  interface IArgs {
    dir: string,
    dependencies: string[],
    logLevel: string,
    'cache-min': string
  }

  export function install(args : Partial<IArgs>, cb: (err : any) => void) : void
}