class Train extends React.Component {
    state = {
        loading: false
    }

    render() {
        return (
            <button onClick={() => {
                this.setState({
                    loading: true,
                }, () => {
                    axios.post(`/api/train`).then(() => {
                        this.setState({
                            loading: false
                        })
                    })
                })
            }} type="button"
                    className="btn btn-primary btn-sm">{this.state.loading ? 'Training...' : 'Retrain model'}</button>
        )
    }
}

ReactDOM.render(<Train/>, document.querySelector('#train'));