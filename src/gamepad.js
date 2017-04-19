( () => {
  const haveEvents = "ongamepadconnected" in window;
  const controllers = {};
  let cooldownedButtons = [];

  const BUTTON = {
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    LB: 4,
    RB: 5,
    LT: 6,
    RT: 7,
    BACK: 8,
    START: 9,
    LEFTSTICK: 10,
    RIGHTSTICK: 11,
    DUP: 12,
    DDOWN: 13,
    DLEFT: 14,
    DRIGHT: 15,
  };

  const AXIS = {
    LOX: 0,
    LOY: 1,
    ROX: 2,
    ROY: 3,
  };

  let pointing = false;
  const pointer = document.createElement( "div" );
  pointer.style.position = "absolute";
  pointer.style.width = "1px";
  pointer.style.height = "1px";
  pointer.style.boxShadow = "0 0 7px 4px #f00";
  pointer.style.background = "#f00";
  pointer.style.top = 0;
  pointer.style.left = 0;
  pointer.style.zIndex = 99;
  pointer.style.borderRadius = "50%";
  pointer.style.display = "none";
  document.body.appendChild( pointer );

  function cooldown( b ) {
    if ( cooldownedButtons.indexOf( b ) < 0 ) {
      cooldownedButtons.push( b );

      setTimeout( () => {
        cooldownedButtons = cooldownedButtons.filter( ( v ) => { return ( v !== b ); } );
      }, 500 );

      return true;
    }

    return false;
  }

  function addgamepad( gamepad ) {
    controllers[gamepad.index] = gamepad;

    requestAnimationFrame( updateStatus ); // eslint-disable-line
  }

  function scangamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : ( navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [] ); // eslint-disable-line no-nested-ternary
    for ( let i = 0; i < gamepads.length; i++ ) {
      if ( gamepads[i] ) {
        if ( gamepads[i].index in controllers ) {
          controllers[gamepads[i].index] = gamepads[i];
        } else {
          addgamepad( gamepads[i] );
        }
      }
    }
  }

  function updateStatus() {
    let i = 0;
    let j;

    if ( !haveEvents ) {
      scangamepads();
    }

    for ( j in controllers ) {
      if ( Object.prototype.hasOwnProperty.call( controllers, j ) ) {
        const controller = controllers[j];

        for ( i = 0; i < controller.buttons.length; i++ ) {
          const val = controller.buttons[i];
          let pressed;

          if ( typeof ( val ) === "object" ) {
            pressed = val.pressed;
          }

          if ( pressed && cooldown( `button-${i}` ) ) {
            switch ( i ) {
              case BUTTON.A:
                if ( Reveal.isOverview() ) {
                  Reveal.toggleOverview();
                } else {
                  Reveal.next();
                }
                break;
              case BUTTON.B:
                Reveal.prev();
                break;
              case BUTTON.LB:
                Reveal.prev();
                break;
              case BUTTON.RB:
                Reveal.next();
                break;
              case BUTTON.LT:
                Reveal.left();
                break;
              case BUTTON.RT:
                Reveal.right();
                break;
              case BUTTON.BACK:
                Reveal.togglePause();
                break;
              case BUTTON.START:
                Reveal.toggleOverview();
                break;
              case BUTTON.DUP:
                Reveal.up();
                break;
              case BUTTON.DDOWN:
                Reveal.down();
                break;
              case BUTTON.DLEFT:
                Reveal.left();
                break;
              case BUTTON.DRIGHT:
                Reveal.right();
                break;
              case BUTTON.RIGHTSTICK:
                pointing = !pointing;
                pointer.style.display = pointing ? "block" : "none";
                break;
              default:
                console.log( i );
            }
          }
        }

        for ( i = 0; i < controller.axes.length; i++ ) {
          const val = controller.axes[i];

          if ( Math.abs( val ) > 0.85 && !pointing ) {
            if ( cooldown( `axis-${i}` ) ) {
              switch ( i ) {
                case AXIS.LOX: {
                  if ( val < 0 ) {
                    Reveal.left();
                  } else {
                    Reveal.right();
                  }
                  break;
                }
                case AXIS.LOY: {
                  if ( val < 0 ) {
                    Reveal.up();
                  } else {
                    Reveal.down();
                  }
                  break;
                }

                // no default
              }
            }
          }

          if ( Math.abs( val ) > 0.2 && pointing ) {
            const fastMultiplier = 8;
            const left = pointer.style.left.replace( "px", "" ) * 1;
            const top = pointer.style.top.replace( "px", "" ) * 1;
            const constrainValue = ( newVal ) => { return Math.min( Math.max( newVal, 0 ), window.innerWidth ); };
            switch ( i ) {
              case AXIS.ROX: {
                const newVal = ( val * 2 ) + left;
                pointer.style.left = `${constrainValue( newVal )}px`;
                break;
              }
              case AXIS.ROY: {
                const newVal = ( val * 2 ) + top;
                pointer.style.top = `${constrainValue( newVal )}px`;
                break;
              }
              case AXIS.LOX: {
                const newVal = ( val * fastMultiplier ) + left;
                pointer.style.left = `${constrainValue( newVal )}px`;
                break;
              }
              case AXIS.LOY: {
                const newVal = ( val * fastMultiplier ) + top;
                pointer.style.top = `${constrainValue( newVal )}px`;
                break;
              }

              // no default
            }
          }
        }
      }
    }

    requestAnimationFrame( updateStatus );
  }

  function connecthandler( e ) {
    addgamepad( e.gamepad );
  }

  function removegamepad( gamepad ) {
    delete controllers[gamepad.index];
  }

  function disconnecthandler( e ) {
    removegamepad( e.gamepad );
  }

  window.addEventListener( "gamepadconnected", connecthandler );
  window.addEventListener( "gamepaddisconnected", disconnecthandler );

  if ( !haveEvents ) {
    setInterval( scangamepads, 500 );
  }
} )();
