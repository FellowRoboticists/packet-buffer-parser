'use strict'

module.exports = (function () {
  const __START_BYTE = 0x13
  const __LEN_IDX = 1

  // The packet from which commands are read from the
  // serial port. Remember, with the serial port you
  // may get only partial data, so you will have to gradually
  // piece together a full packet from potentially many
  // buffers.
  let __packet = []
  let __remainder = []

  const __seek = (buffer) => {
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === __START_BYTE) return i
    }
    return -1
  }

  const parse = (buffer) => {
    // index to start reading packet
    // data, default to invalid value
    let start = -1

    if (!buffer) {
      buffer = new Buffer(__remainder)
    }

    if (__packet.length === 0) {
      start = __seek(buffer)
    } else {
      start = 0 // we already have the header stored in __packet, read full buff
    }

    if (start === -1) { // couldn't seek to START_BYTE
      return
    }

    // Push the buffer bytes into the packet
    for (let i = start; i < buffer.length; i++) {
      __packet.push(buffer[i])
    }

    if (__packet.length < 2) {
      // Haven't read the length byte yet move along
      return
    }

    if (__packet[__LEN_IDX] === 0) {
      // The length of the packet is 0 clear out and
      // move on.
      __packet = []
      return
    }

    // +3 due to START byte, COUNT byte & CHKSUM bytes included with all pkts
    if (__packet.length < (__packet[__LEN_IDX] + 3)) return

    // extract one whole packet from pkt buffer
    let currPkt = __packet.splice(0, __packet[__LEN_IDX] + 3)
    if (__packet.length > 0) {
      // We have more than we need in the __packet. Let's save
      // off the excess in __remainder so we can use it later
      // if desired.
      __remainder = __packet.splice(0, __packet.length)
    } else {
      __remainder = []
    }

    let chksum = 0
    for (let i = 0; i < currPkt.length; i++) {
      chksum += currPkt[i]
    }

    chksum = chksum & 0xff

    if (chksum === 0) {
      return currPkt
    } else {
      // Invalid checksum. There's no hope for this one
      reset()
    }
  }

  /**
   * The specification of values should be an
   * array of objects of the form:
   * [
   *   {
   *     name: 'sensor1',
   *     startByte: 0x12,
   *     numBytes: 1
   *   },
   *   {
   *     name: 'sensor2',
   *     startByte: 0x13,
   *     numBytes: 2
   *   }
   * ]
   *
   * If there was a valid packet, an array of objects of
   * the following form will be returned:
   *
   * [
   *   {
   *     name: 'sensor1',
   *     value: 23
   *   },
   *   ...
   * ]
   */
  const parseAndExtract = (buffer, valueDefinitions) => {
    let pkt = parse(buffer)
    if (!pkt) { return null }

    let values = []

    // Got a valid packet, extract the data from it
    // We start at 2: one after the length byte
    // We process only pkt len (pkt[1]) bytes
    for (let i = 2; i < pkt[1]; i++) {
      let valueType = __findValueType(valueDefinitions, pkt[i])
      if (!valueType) {
        throw new Error('Unknown sensor start byte: ' + pkt[i])
      }

      if (valueType.numBytes === 1) {
        values.push({
          name: valueType.name,
          value: pkt[i + 1]
        })
        i += 1
      } else {
        values.push({
          name: valueType.name,
          value: pkt[i + 1] << 8 | pkt[i + 2]
        })
        i += 2
      }
    }

    reset()

    return values
  }

  const __findValueType = (values, startByte) => {
    let value = null
    for (let i = 0; i < values.length; i++) {
      if (values[i].startByte === startByte) {
        value = values[i]
        break
      }
    }
    return value
  }

  const reset = () => {
    __packet = []
  }

  var mod = {

    parse: parse,
    parseAndExtract: parseAndExtract,
    reset: reset

  }

  return mod
}())
