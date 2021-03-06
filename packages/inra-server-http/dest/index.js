"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _inraServerContainer = require("inra-server-container");

var _inraServerContainer2 = _interopRequireDefault(_inraServerContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrapper for common Node.js frameworks. Creates micro applications which are
 * suitable for small applications that will have very low overhead. Such apps
 * are for instance websites, documentations, APIs, prototypes etc. It creates
 * a HTTP(S) server on a given port and populates it with specified resources.
 *
 * This class aims to be a better, more expressive, and more robust foundation
 * for web applications and APIs.
 *
 * Each App instance is a Proxy which defines custom behaviors for fundamental
 * operations such as "magic" setters and getters:
 *  • Setters are used to prevent developers from overriding server internals.
 *    Additionally, custom-defined properties will be added to an internal Map
 *    object which serves as Dependency injector.
 *  • Getters retrieve those properties from the Map by key, if such key doesn't
 *    exist in server instance.
 */

let App = class App {

  /**
   * Returns a Proxy instance which defines magic global getters and setters for
   * Server class. It allows us to reflect all custom properties to a dependency
   * injector which keeps fundamental object safe and immutable. Gives another
   * layer of abstraction for data.
   *
   * @param   {ServerConfig}  config
   * @return  {Proxy<App>}
   */


  /**
   * Object containing all registered and already initialised middlewares. Each
   * middleware should be a class. Methods are executed in the order below:
   * 1. `async before(ctx, next, ...rest);`
   * 2. `async handle(ctx, next, ...rest);`
   * 3. `async after(ctx, next, ...rest);`
   *
   * @type    {Middlewares}
   * @access  public
   * @readonly
   */

  // Limitations on Flow v0.72.0: https://github.com/facebook/flow/issues/6314
  constructor(config = this.config) {
    this.config = {
      port: 8000
    };
    this.middlewares = {};
    this.di = new _inraServerContainer2.default();

    this.config = config;

    return new Proxy(this, {
      set(target, key, value) {
        target.di.set(key, value);
        return true;
      },

      get(target, key) {
        return target[key] || target.di.get(key);
      }
    });
  }

  /**
   * Sets engine for our server. Each engine must implement methods described in
   * `EngineInterface`.
   *
   * @param   {EngineInterface}   engine
   * @return  {this}
   * @access  public
   */


  /**
   * Container used as a linked list for storing custom application data such as
   * models, configurations etc.
   *
   * @type    {Container}
   * @access  public
   * @readonly
   */
  setEngine(engine) {
    if (this.engine) {
      throw new Error("Cannot override engine");
    }

    this.engine = engine;

    return this;
  }

  /**
   * Sets router for our server. Each router must implement methods described in
   * RouterInterface.
   *
   * @param   {RouterInterface}   router
   * @return  {this}
   * @access  public
   */
  setRouter(router) {
    if (this.router) {
      throw new Error("Cannot override router");
    }

    this.router = router;

    return this;
  }

  /**
   * Mounts the specified middleware function or functions.
   *
   * @param   {Function}  middleware
   * @return  {this}
   * @access  public
   */
  use(middleware) {
    if (!this.engine) {
      throw new Error("Server engine not specified");
    }

    this.engine.use(middleware);

    return this;
  }

  /**
   * Imports and initialises a given resource. Each resource is a function which
   * accepts a server instance as argument. Supports both ES6 modules and olders
   * modules.
   *
   * @param   {string}    path    Full path to the resource
   * @return  {any}
   * @access  public
   */
  import(path) {
    let resource = require(path);

    // When not using "babel-plugin-add-module-exports":
    if (typeof resource !== "function") {
      if (!("default" in resource) || typeof resource.default !== "function") {
        throw new TypeError("Your import doesn't return any default function");
      }

      // Probably an ES6+ module at this point:
      resource = resource.default;
    }

    return resource(this);
  }

  /**
   * Listens on a given port.
   *
   * @param   {?number}     port
   * @param   {?Function}   callback
   * @return  {this}
   * @access  public
   */
  run(port = this.config.port, callback) {
    if (!this.engine) {
      throw new Error("Server engine not specified");
    }

    this.native = this.engine.listen(port, callback);

    return this;
  }
};
exports.default = App;