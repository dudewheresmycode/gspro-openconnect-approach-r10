export function get_success_message(type) {
  const message = {
      Details: 'Success.',
      SubType: type,
      Type: 'ACK',
  }
  return JSON.stringify(message)
}

export function get_handshake_message(step) {
  let message
  if (step == 1) {
    message = {
      Challenge: 'gQW3om37uK4OOU4FXQH9GWgljxOrNcL5MvubVHAtQC0x6Z1AwJTgAIKyamJJMzm9',
      E6Version: '2, 0, 0, 0',
      ProtocolVersion: '1.0.0.5',
      RequiredProtocolVersion: '1.0.0.0',
      Type: 'Handshake',
    }
  } else {
    message = {
        Success: 'true',
        Type: 'Authentication',
    }
  }

  return JSON.stringify(message)
}

export function get_sim_command(type) {
  const message = {
      SubType: type,
      Type: 'SimCommand',
  }
  return JSON.stringify(message)
}
