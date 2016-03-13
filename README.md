packet-buffer-parser
====================

A library to support binary packet buffers of the form:

    Byte 1: start byte; must be 0x13
    Byte 2: number of data bytes
    Bytes 3-n: data bytes. Byte 2 specifies the number of these bytes
    Byte n+1: checksum - see details below

This is the format of packet buffers read off the serial port of an iRobot Create
using their object interface and it will be the format of the sensor data I will
return from my Arduino robot(s).

This parser can handle reading incomplete data sequentially until it has a complete
and valid packet. This is a fairly typical situation when reading data off a serial
port.

The parser makes no assumption and passes no judgement about the content of the data bytes,
it is concerned solely with the structure as defined above.

Checksum
--------

Checksums are useful in a situation like this due to the possibility of corrupt
data being read off potentially flaky interfaces. They are a way ensuring that 
the data being processed is 'sane'.

There are a variety of ways to handle checksum processing. This particular parser
will handle checksums created by the iRobot Create correctly.

The easiest way to explain how it works is by example. Let's say the packet is 
composed of the following bytes:

    var buffer = [0x13,0x0b,0x07,0x00,0x13,0x23,0x18,0x14,0x00,0x00,0x21,0x01,0x1f,0x38];

If you add up all the bytes then mask only one byte, it should be 0 to be valid.

    var chksum = 0;
    for (var i=0; i<buffer.length; i++) {
      chksum += buffer[i];
    }

    chksum & 0xff === 0

That's all there is to it.

Usage
-----

Assuming you're reading data off a serial port:

    const ppb = require('parse-packet-buffer');
    ...
    serial.on('data', function(data) {
      var packet = ppb.parse(data);
      if (packet) {
        // This means we read a complete packet...
        // Do something with it
        ...
        ppb.reset(); // Empty out the current packet to
                     // get ready for the next packet
    });


To simplify the process of reading sensor values out of the 
buffer, you can use the 'parseAndExtract() method. This function
allows you to specify the types of sensor values that can be
read and the method will return the sensor values already
parsed and ready to go. 

    const ppb = require('parse-packet-buffer');

    const SENSOR_TYPES = {
      {
        name: 'sensor1', // The name for the sensor value
        startByte: 0x14, // The value of the start byte for the sensor packet
        numBytes: 1      // The number of bytes for the value
      },
      {
        name: 'sensor2',
        startByte: 0x29,
        numBytes: 2
      }
    };

    ...
    serial.on('data', function(data) {
      var sensorValues = parser.parseAndExtract(data, SENSOR_TYPES);
      while (sensorValues) {

        for (var i=0; i<sensorValues.length; i++) {
          console.log("Sensor: %s = %d", sensorValues[i].name, sensorValues[i].value);
        }

        // Call again with null buffer to pick up any serial buffer
        // remainder from the previous call.
        sensorValues = parser.parseAndExtract(null, SENSOR_TYPES);
      }
    });


Copyright
=========

Copyright (c) 2016 Naive Roboticist

See LICENSE.txt for details.
