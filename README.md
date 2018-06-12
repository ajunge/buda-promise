# Buda

    npm install buda-promise

A basic API wrapper for the [Buda REST API](https://api.buda.com/). Please refer to [their documentation](https://api.buda.com/) for all calls explained. Check out `example.js` for a list of all possible calls and their parameters.

```javascript
var Buda = require('buda-promise');
var buda = new Buda;

buda.ticker('btc-clp')
  .then(function(ticks) {
    console.log(ticks);  
  });
```

## 0.1.0 - First version

Check out the examples in `example.js`.

# Final

If this wrapper helped you in any way, you can always leave me a tip at 

or the inspiration author from (https://github.com/leggiero/bitstamp-promise) at
(BTC) 1KyQdQ9ctjCrGjGRCWSBhPKcj5omy4gv5S

# License

The MIT License (MIT)

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
