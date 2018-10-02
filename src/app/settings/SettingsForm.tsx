import { remote } from "electron"
import React, { FocusEvent, KeyboardEvent } from "react"

const settings = remote.require('schema-settings')

export class SettingsForm extends React.Component<any, any> {
  constructor(props : any) {
    super(props)

    this.onKeyUp = this.onKeyUp.bind(this)
    this.onFocusLeft = this.onFocusLeft.bind(this)
  }

  public render() {
    return (
    <div>
      {this.generateSettingsElements()}
    </div>
    )
  }

  private generateSettingsElements() {
    const obj = settings.getAll()
    const exploded = this.explodeObject(obj)

    // convert the elements to the react components
    const elements = exploded
      .map((e) => {
        return (
          <React.Fragment key={`${e.path}.${e.key}`}>
            <p>{e.key}:</p>
            <input
              type="text"
              data-path={`${e.path}.${e.key}`}
              defaultValue={e.val}
              onKeyUp={this.onKeyUp}
              onBlur={this.onFocusLeft}
            />
          </React.Fragment>
        )
      })

    // given the set of elements, find unique headers that need to get added
    const headers = elements
      .map((e, i) => ({key: (e.key as string).substring(0, (e.key as string).lastIndexOf('.')), srcIndex: i}))
      .filter((e, i, a) => a.map(f => f.key).indexOf(e.key) === i)
    
    // for each unique header, we'll insert it (note that insertion indices move as we insert)
    headers.forEach((h, i) => {
      elements.splice(h.srcIndex + i, 0, <h1 key={h.key}>{h.key}</h1>)
    })

    return elements
  }

  private explodeObject(obj : {[key : string] : any}) {
    const needsRecurse = (s : any) => typeof s === 'object' && !Array.isArray(s)
    const needsEnumerate = (s : any) => Array.isArray(s)
    
    const inner = (s : {[key : string] : any}, pkey ?: string) => {
      const result : Array<{key : string, val : any, path : string}> = []
      for (const key in s) {
        if (typeof s[key] !== 'undefined') {
          const val = s[key]

          if (needsRecurse(val)) {
            // add the inner data objects to results, being sure to tell inner where we are in the object structure
            result.push(...inner(val, `${pkey ? `${pkey}.` : ''}${key}`))
          } else if (needsEnumerate(val)) {
            // add the inner data objects to results, being sure to tell inner we're in an array
            // we use reduce because we don't have flatMap yet, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap#Alternative
            result.push(...val.reduce((acc : any, e : any, i : number) => acc.concat(inner(e, `${pkey ? `${pkey}.` : ''}${key}[${i}]`)), []))
          } else {
            // add a literal representation to the results
            result.push({
              key,
              path: pkey ? pkey : '',
              val,
            })
          }
        }
      }

      // return all the objects
      return result
    }

    // do the work
    return inner(obj)
  }

  private onKeyUp(e : KeyboardEvent) {
    // you hit enter
    if (e.keyCode === 13) {
      this.onFocusLeft({
        target: e.target
      } as FocusEvent)
    }
  }

  private onFocusLeft(e : FocusEvent) {
    const field : any = (e.target as HTMLInputElement).value
    const path = (e.target as HTMLInputElement).getAttribute('data-path') as string


  }
}