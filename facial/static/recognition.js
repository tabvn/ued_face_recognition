var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Recognition = function (_React$Component) {
    _inherits(Recognition, _React$Component);

    function Recognition() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Recognition);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Recognition.__proto__ || Object.getPrototypeOf(Recognition)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
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
                height: 0
            }
        }, _this.calculateZoomSize = function (file) {
            if (!_this.state.loaded) {
                return 1;
            }
            var width = file.width,
                height = file.height;

            var container_ratio = _this.state.viewer.width / _this.state.viewer.height;
            var image_ratio = width / height;

            return container_ratio > image_ratio ? _this.state.viewer.height / height : _this.state.viewer.width / width;
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Recognition, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            axios.get('/api/users').then(function (res) {
                _this2.setState({
                    users: res.data
                });
            }).catch(function (e) {
                console.log(e);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var result = this.state.result;

            var zoom = this.calculateZoomSize(result);

            var selectedFace = this.state.selectedIndex > -1 ? result['faces'][this.state.selectedIndex] : null;
            return React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'div',
                    { className: 'col-md-9' },
                    React.createElement(
                        'h1',
                        { className: 'page-title' },
                        'Upload an image for face recognition'
                    ),
                    result ? React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'div',
                            { className: 'alert alert-info' },
                            React.createElement(
                                'p',
                                null,
                                'Found ',
                                result.faces.length,
                                ' faces in the picture.',
                                result.faces.length > 0 && React.createElement(
                                    'span',
                                    null,
                                    'Click to face rectangle to see more information.'
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { style: this.state.loaded ? {
                                    width: this.state.viewer.width,
                                    height: this.state.viewer.height
                                } : null, className: 'viewer', ref: function ref(_ref2) {
                                    return _this3.viewerElement = _ref2;
                                } },
                            React.createElement('img', { onLoad: function onLoad() {
                                    _this3.setState({
                                        loaded: true,
                                        viewer: {
                                            width: _this3.viewerElement.clientWidth,
                                            height: _this3.viewerElement.clientHeight
                                        }
                                    });
                                }, src: '/files/' + result.name, alt: '' }),
                            result.faces.map(function (face, index) {
                                var top = face.top * zoom;
                                var left = face.left * zoom;
                                var w = face.right * zoom - left;
                                var h = face.bottom * zoom - top;

                                var faceStyle = {
                                    top: top + 'px',
                                    left: left + 'px',
                                    width: w + 'px',
                                    height: h + 'px',
                                    border: '2px solid #0056b3',
                                    borderRadius: '3px',
                                    position: 'absolute'
                                };

                                if (_this3.state.selectedIndex === index) {
                                    faceStyle.border = '2px solid red';
                                }
                                return React.createElement(
                                    'div',
                                    { onClick: function onClick() {
                                            _this3.setState({
                                                selectedIndex: index
                                            });
                                        }, key: index, style: faceStyle, className: 'face-rect' },
                                    React.createElement(
                                        'span',
                                        { style: {
                                                background: 'rgba(0,0,0,0.2)',
                                                color: '#FFF',
                                                fontSize: '11px'
                                            } },
                                        face.user ? face.user.name : 'Unknown'
                                    )
                                );
                            })
                        )
                    ) : React.createElement(
                        'form',
                        { onSubmit: function onSubmit(e) {
                                e.preventDefault();
                                if (!_this3.state.file) {
                                    alert("Image is required");
                                    return;
                                }

                                _this3.setState({ loading: true }, function () {

                                    var formData = new FormData();
                                    formData.append('file', _this3.state.file);
                                    axios.post('/api/detect', formData).then(function (res) {
                                        console.log(res);
                                        _this3.setState({
                                            loading: false,
                                            file: null,
                                            result: res.data
                                        });
                                    }).catch(function (e) {
                                        console.log(e);
                                        alert("An error uploading image.");
                                        _this3.setState({
                                            loading: false
                                        });
                                    });
                                });
                            } },
                        React.createElement(
                            'div',
                            { className: 'form-group' },
                            React.createElement('input', { onChange: function onChange(e) {
                                    _this3.setState({
                                        file: e.target.files[0]
                                    });
                                }, type: "file", accept: 'image/*' })
                        ),
                        React.createElement(
                            'button',
                            { type: 'submit', className: 'btn btn-primary' },
                            this.state.loading ? 'Uploading...' : 'Upload'
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'col-md-3' },
                    this.state.selectedIndex > -1 && React.createElement(
                        'div',
                        { className: 'card' },
                        React.createElement(
                            'div',
                            { className: 'card-body' },
                            React.createElement(
                                'div',
                                {
                                    className: 'card-title' },
                                selectedFace.user ? selectedFace.user.name : 'Unknown'
                            ),
                            selectedFace.user && React.createElement(
                                'p',
                                { className: 'card-text' },
                                'User ID: ',
                                selectedFace.user._id
                            )
                        )
                    )
                )
            );
        }
    }]);

    return Recognition;
}(React.Component);

ReactDOM.render(React.createElement(Recognition, null), document.querySelector('#page'));