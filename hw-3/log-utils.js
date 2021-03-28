const { appendFile, appendFileSync } = require('fs');

let _logFileName;

exports.createLogFile = () => {
  const currentDateArray = new Date().toISOString().split('T');
  _logFileName = `${currentDateArray[0]}_${currentDateArray[1].split('.')[0].split(':').join('-')}`;
  appendFileSync(`./log/${_logFileName}.txt`, '-', function (err) {
    if (err) throw err;
  });
}

exports.logToFile = async (data) => {
  await appendFile(`./log/${_logFileName}.txt`, data, function (err) {
    if (err) throw err;
  });
}
