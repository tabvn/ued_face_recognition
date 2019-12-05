class Users extends React.Component {
    state = {
        dataSource: [],
        name: '',
        error: null
    }

    componentDidMount() {
        axios.get('/api/users').then((res) => {
            console.log("res", res)
            this.setState({dataSource: res.data})
        }).catch((e) => {
            console.log(e)
        })
    }

    render() {
        const {dataSource} = this.state

        return (
            <div className={'row'}>
                <div className={'col-md-8'}>
                    <h1 className={"page-title"}>Users</h1>

                    <table className={'table table-hover'}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            dataSource.map((user, index) => (
                                <tr key={index}>
                                    <td>{user._id}</td>
                                    <td>{user.name}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
                <div className={'col-md-4'}>
                    <h2 className={'sidebar-title'}>Create new User</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        if (!this.state.name) {
                            alert("Name is required.")
                            return
                        }
                        axios.post('/api/users', {
                            name: this.state.name,
                        }).then((res) => {
                            this.setState({
                                dataSource: [...dataSource, res.data],
                                name: ''
                            })
                        }).catch((e) => {
                            console.log(e)
                            alert("An error!")
                        })
                    }}>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                value={this.state.name} onChange={(e) => {
                                this.setState({name: e.target.value})
                            }} type="text" className="form-control" id="name"/>
                        </div>
                        <button className={'btn btn-primary'} type="submit">Create</button>
                    </form>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<Users/>, document.querySelector('#page'));