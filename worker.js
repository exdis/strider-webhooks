
var utils = require('./lib/utils')

module.exports = {
  // run for each job
  init: function (config, job, context, cb) {
    var hooks = utils.makeWebHooks(config || [], job)
    cb(null, {
      listen: function (io, context) {
        function onTested(id, data) {
          io.removeListener('job.status.tested', onTested)
          hooks.forEach(function (hook) {
            context.comment('Firing webhook ' + hook.title)
            try {
              var payload = hook.prepare(data, job)
              io.emit('plugin.webhooks.fire', hook.url, hook.secret, payload)
            } catch (e) {
              context.comment('Failed to prepare webhook payload: ' + e.message);
              return
            }
          })
        }
        io.on('job.status.tested', function (id, data) {
          if (job._id === id) {
            onTested(id, data);
          }
        });
      }
    })
  },
}
