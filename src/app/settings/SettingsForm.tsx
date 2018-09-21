import { remote } from "electron"
import React from "react"

const settings = remote.require('electron-settings')

export class SettingsForm extends React.Component<any, any> {
  public render() {
    return (
    <div>
      {this.generateSettingsElements()}
    </div>
    )
  }

  private T() {
    const settings = {
      overlayed: {
        layout: [
          {
            i: 'one'
          },
          {
            i: 'two'
          }
        ]
      }
    }
  }

  private generateSettingsElements(srcObj ?: any, srcProp : string = '') {
    const obj = srcObj ? srcObj : settings.getAll() as {[key : string] : any}

    const res : Array<React.ReactElement<any>> = []
    for (const prop in obj) {
      if (obj[prop]) {
        const val = obj[prop]

        if (typeof val === 'object') {
          let subObj

          if (Array.isArray(val)) {
            // this is cool..but also confusing :)
            // what we're doing is mapping the array to an object with the index values as keys
            // ie: { '0': valAtIndex0, '1': valAtIndex1 }
            subObj = val.reduce((prev, cur, index) => ({...prev, ...{[index]: cur}}), {})
          } else {
            subObj = val
          }
          res.push(<h1>{prop}</h1>)
          res.push(...this.generateSettingsElements(subObj, srcProp + prop))
        } else {
          // if we have a literal, make a little input field
          res.push(
            <React.Fragment>
              <p>{prop}:</p>
              <input type="text" value={val} />
            </React.Fragment>
          )
        }
      }
    }

    // add a key to each element (where the key is the element index)
    return res.map((e,i) => ({...e, ...{key: `${srcProp}-${i}`}}))
  }
}