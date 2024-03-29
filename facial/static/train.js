var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Train = function (_React$Component) {
    _inherits(Train, _React$Component);

    function Train() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Train);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Train.__proto__ || Object.getPrototypeOf(Train)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            loading: false
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Train, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            return React.createElement(
                "button",
                { onClick: function onClick() {
                        _this2.setState({
                            loading: true
                        }, function () {
                            axios.post("/api/train").then(function () {
                                _this2.setState({
                                    loading: false
                                });
                            });
                        });
                    }, type: "button",
                    className: "btn btn-primary btn-sm" },
                this.state.loading ? 'Training...' : 'Retrain model'
            );
        }
    }]);

    return Train;
}(React.Component);

ReactDOM.render(React.createElement(Train, null), document.querySelector('#train'));