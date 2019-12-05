class Upload extends React.Component {
    state = {
        file: null,
        loading: false,
        result: null,
        loaded: false,
        selectedIndex: -1,
        users: [],
        taggedUserId: null,
        tagLoading: false,
        viewer: {
            width: 0,
            height: 0,
        }
    };

    calculateZoomSize = (file) => {
        if (!this.state.loaded) {
            return 1
        }
        const {width, height} = file
        const container_ratio = this.state.viewer.width / this.state.viewer.height
        const image_ratio = width / height

        return container_ratio > image_ratio ?
            this.state.viewer.height / height :
            this.state.viewer.width / width

    }

    componentDidMount() {
        axios.get(`/api/users`).then(res => {
            this.setState({
                users: res.data,
            })
        }).catch((e) => {
            console.log(e)
        })
    }

    render() {
        const {result} = this.state
        const zoom = this.calculateZoomSize(result)
        return (
            <div className={'row'}>
                <div className={'col-md-9'}>
                    <h1 className={"page-title"}>{result ? 'Upload completed' : 'Upload'}</h1>
                    {
                        result ? (
                                <div>
                                    <div className={'alert alert-info'}>
                                        <p>Found {result.faces.length} faces in the picture.
                                            {result.faces.length > 0 && (
                                                <span>Click to face rectangle to begin tag people.</span>
                                            )}
                                        </p>
                                    </div>
                                    <div style={this.state.loaded ? {
                                        width: this.state.viewer.width,
                                        height: this.state.viewer.height
                                    } : null} className={'viewer'} ref={(ref) => this.viewerElement = ref}>
                                        <img onLoad={() => {
                                            this.setState({
                                                loaded: true,
                                                viewer: {
                                                    width: this.viewerElement.clientWidth,
                                                    height: this.viewerElement.clientHeight,
                                                }
                                            })
                                        }} src={`/files/${result.name}`} alt={''}/>
                                        {
                                            result.faces.map((face, index) => {
                                                const top = face.top * zoom
                                                const left = face.left * zoom
                                                const w = face.right * zoom - left
                                                const h = face.bottom * zoom - top

                                                let faceStyle = {
                                                    top: `${top}px`,
                                                    left: `${left}px`,
                                                    width: `${w}px`,
                                                    height: `${h}px`,
                                                    border: '2px solid #0056b3',
                                                    borderRadius: '3px',
                                                    position: 'absolute'
                                                };

                                                if (this.state.selectedIndex === index) {
                                                    faceStyle.border = '2px solid red'
                                                }
                                                return (
                                                    <div onClick={() => {
                                                        this.setState({
                                                            selectedIndex: index,
                                                        })
                                                    }} key={index} style={faceStyle} className={'face-rect'}/>
                                                )
                                            })
                                        }

                                    </div>
                                </div>
                            ) :
                            (
                                <form onSubmit={(e) => {
                                    e.preventDefault()
                                    if (!this.state.file) {
                                        alert("Image is required")
                                        return
                                    }

                                    this.setState({loading: true}, () => {

                                        let formData = new FormData()
                                        formData.append('file', this.state.file)
                                        axios.post('/api/upload', formData).then((res) => {
                                            console.log(res)
                                            this.setState({
                                                loading: false,
                                                file: null,
                                                result: res.data,
                                            })
                                        }).catch((e) => {
                                            console.log(e)
                                            alert("An error uploading image.")
                                            this.setState({
                                                loading: false,
                                            })
                                        })
                                    })

                                }}>
                                    <div className={'form-group'}>
                                        <input onChange={(e) => {
                                            this.setState({
                                                file: e.target.files[0]
                                            })
                                        }} type={"file"} accept={'image/*'}/>
                                    </div>
                                    <button type="submit" className={'btn btn-primary'}>
                                        {
                                            this.state.loading ? 'Uploading...' : 'Upload'
                                        }
                                    </button>
                                </form>
                            )
                    }
                </div>
                <div className={'col-md-3'}>
                    {
                        this.state.selectedIndex > -1 && (
                            <div>
                                <h2 className={'sidebar-title'}>Tag this face</h2>
                                <form onSubmit={(e) => {
                                    e.preventDefault()
                                    if (!this.state.taggedUserId) {
                                        alert("Select user to tag")
                                        return
                                    }
                                    axios.post(`/api/tag`, {
                                        id: result._id,
                                        index: this.state.selectedIndex,
                                        userId: this.state.taggedUserId,
                                    }).then((res) => {
                                        this.setState({
                                            taggedUserId: '',
                                        }, () => {
                                            alert("Face has been tagged successful.")
                                        })
                                    }).catch((e) => {
                                        console.log("err", e)
                                    })
                                }}>
                                    <div className={'form-group'}>
                                        <select
                                            value={this.state.taggedUserId}
                                            onChange={(e) => {
                                                this.setState({taggedUserId: e.target.value})
                                            }}>
                                            <option value={''}>Select pepple to tag?</option>
                                            {this.state.users.map((user, index) => (
                                                <option key={index} value={user._id}>{user.name}</option>
                                            ))}
                                        </select>

                                    </div>
                                    <div className={'form-group'}>
                                        <label htmlFor="name">Face encoding</label>
                                        <textarea onChange={() => {

                                        }} value={JSON.stringify(result.faces[this.state.selectedIndex])}/>
                                    </div>
                                    <button type={'submit'} className={'btn btn-primary'}>Save</button>
                                </form>
                            </div>
                        )
                    }
                </div>

            </div>
        )
    }
}

ReactDOM.render(<Upload/>, document.querySelector('#page'));