class Users extends React.Component {

    componentDidMount() {
        axios.get('/api/users').then((res) => {
            console.log("res", res)
        })
    }

    render() {
        return (
            <div className={'users'}>
                <div className={'user-list'}>

                </div>
                <div className={'sidebar'}>

                </div>
            </div>
        )
    }
}

ReactDOM.render(<Users/>, document.querySelector('#users'));