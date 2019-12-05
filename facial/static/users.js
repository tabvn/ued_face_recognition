var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Users = function (_React$Component) {
    _inherits(Users, _React$Component);

    function Users() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Users);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Users.__proto__ || Object.getPrototypeOf(Users)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            dataSource: [],
            name: '',
            error: null
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Users, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            axios.get('/api/users').then(function (res) {
                console.log("res", res);
                _this2.setState({ dataSource: res.data });
            }).catch(function (e) {
                console.log(e);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var dataSource = this.state.dataSource;


            return React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'div',
                    { className: 'col-md-8' },
                    React.createElement(
                        'h1',
                        { className: "page-title" },
                        'Users'
                    ),
                    React.createElement(
                        'table',
                        { className: 'table table-hover' },
                        React.createElement(
                            'thead',
                            null,
                            React.createElement(
                                'tr',
                                null,
                                React.createElement(
                                    'th',
                                    null,
                                    'ID'
                                ),
                                React.createElement(
                                    'th',
                                    null,
                                    'Name'
                                )
                            )
                        ),
                        React.createElement(
                            'tbody',
                            null,
                            dataSource.map(function (user, index) {
                                return React.createElement(
                                    'tr',
                                    { key: index },
                                    React.createElement(
                                        'td',
                                        null,
                                        user._id
                                    ),
                                    React.createElement(
                                        'td',
                                        null,
                                        user.name
                                    )
                                );
                            })
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'col-md-4' },
                    React.createElement(
                        'h2',
                        { className: 'sidebar-title' },
                        'Create new User'
                    ),
                    React.createElement(
                        'form',
                        { onSubmit: function onSubmit(e) {
                                e.preventDefault();
                                if (!_this3.state.name) {
                                    alert("Name is required.");
                                    return;
                                }
                                axios.post('/api/users', {
                                    name: _this3.state.name
                                }).then(function (res) {
                                    _this3.setState({
                                        dataSource: [].concat(_toConsumableArray(dataSource), [res.data]),
                                        name: ''
                                    });
                                }).catch(function (e) {
                                    console.log(e);
                                    alert("An error!");
                                });
                            } },
                        React.createElement(
                            'div',
                            { className: 'form-group' },
                            React.createElement(
                                'label',
                                { htmlFor: 'name' },
                                'Name'
                            ),
                            React.createElement('input', {
                                value: this.state.name, onChange: function onChange(e) {
                                    _this3.setState({ name: e.target.value });
                                }, type: 'text', className: 'form-control', id: 'name' })
                        ),
                        React.createElement(
                            'button',
                            { className: 'btn btn-primary', type: 'submit' },
                            'Create'
                        )
                    )
                )
            );
        }
    }]);

    return Users;
}(React.Component);

ReactDOM.render(React.createElement(Users, null), document.querySelector('#page'));