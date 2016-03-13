const test = require('blue-tape');
const parser = require('../lib/index');

test('parseAndExtract valid packet', (assert) => {
  var buffer = [ 
    0x13, 
    0x0b, 
    0x07, 0x00, 
    0x13, 0x23, 0x18, 
    0x14, 0x00, 0x00, 
    0x21, 0x01, 0x1f, 
    -200 
  ];

  var sensorValues = [
    {
      name: 'value1',
      startByte: 0x07,
      numBytes: 1
    },
    {
      name: 'value2',
      startByte: 0x13,
      numBytes: 2
    },
    {
      name: 'value3',
      startByte: 0x14,
      numBytes: 2
    },
    {
      name: 'value4',
      startByte: 0x21,
      numBytes: 2
    }
  ];

  parser.reset();

  var b = new Buffer(buffer);

  var extractedValues = parser.parseAndExtract(b, sensorValues);

  assert.equal(extractedValues.length, 4,
               'Must be 4 returned values');
  assert.equal(extractedValues[0].name, 'value1',
               'Must be value1');
  assert.equal(extractedValues[0].value, 0,
               'Must be 0');
  assert.equal(extractedValues[1].name, 'value2',
               'Must be value2');
  assert.equal(extractedValues[1].value, 8984,
               'Must be 8984');
  assert.equal(extractedValues[2].name, 'value3',
               'Must be value3');
  assert.equal(extractedValues[2].value, 0,
               'Must be 0');
  assert.equal(extractedValues[3].name, 'value4',
               'Must be value4');
  assert.equal(extractedValues[3].value, 287,
               'Must be 287');
  assert.end();
});

test('parseAndExtract multiple valid packets', (assert) => {
  var buffer = [ 
    0x13, // Start of first packet
    0x0b, 
    0x07, 0x00, 
    0x13, 0x23, 0x18, 
    0x14, 0x00, 0x00, 
    0x21, 0x01, 0x1f, 
    -200,
    0x13, // Start of second packet
    0x0b, 
    0x07, 0x00, 
    0x13, 0x23, 0x18, 
    0x14, 0x00, 0x00, 
    0x21, 0x01, 0x1f, 
    -200 
  ];

  var sensorValues = [
    {
      name: 'value1',
      startByte: 0x07,
      numBytes: 1
    },
    {
      name: 'value2',
      startByte: 0x13,
      numBytes: 2
    },
    {
      name: 'value3',
      startByte: 0x14,
      numBytes: 2
    },
    {
      name: 'value4',
      startByte: 0x21,
      numBytes: 2
    }
  ];

  parser.reset();

  var b = new Buffer(buffer);

  var extractedValues = parser.parseAndExtract(b, sensorValues);

  assert.equal(extractedValues.length, 4,
               'Must be 4 returned values');
  assert.equal(extractedValues[0].name, 'value1',
               'Must be value1');
  assert.equal(extractedValues[0].value, 0,
               'Must be 0');
  assert.equal(extractedValues[1].name, 'value2',
               'Must be value2');
  assert.equal(extractedValues[1].value, 8984,
               'Must be 8984');
  assert.equal(extractedValues[2].name, 'value3',
               'Must be value3');
  assert.equal(extractedValues[2].value, 0,
               'Must be 0');
  assert.equal(extractedValues[3].name, 'value4',
               'Must be value4');
  assert.equal(extractedValues[3].value, 287,
               'Must be 287');

  // Process the second packet
  extractedValues = parser.parseAndExtract(null, sensorValues);

  assert.equal(extractedValues.length, 4,
               'Must be 4 returned values');
  assert.equal(extractedValues[0].name, 'value1',
               'Must be value1');
  assert.equal(extractedValues[0].value, 0,
               'Must be 0');
  assert.equal(extractedValues[1].name, 'value2',
               'Must be value2');
  assert.equal(extractedValues[1].value, 8984,
               'Must be 8984');
  assert.equal(extractedValues[2].name, 'value3',
               'Must be value3');
  assert.equal(extractedValues[2].value, 0,
               'Must be 0');
  assert.equal(extractedValues[3].name, 'value4',
               'Must be value4');
  assert.equal(extractedValues[3].value, 287,
               'Must be 287');
  assert.end();
});
