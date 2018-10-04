import React from "react"

export class ErrorBoundary extends React.Component<{onError: (err : Error) => void}, {hasError: boolean}> {
  constructor(props : any) {
    super(props)
    this.state = { hasError: false }
  }

  public componentDidCatch(error : Error) {
    this.setState({ hasError: true })
    this.props.onError(error)
  }

  public render() {
    if (this.state.hasError) {
      return <h1>Failed to Render</h1>
    }

    return this.props.children
  }
}