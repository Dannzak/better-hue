// Author: Danny Schotanus
//Get the variables if availabe
function init() {
    var key = Homey.get('constellation-bridge-key', function(err, key){ 
                if( err ) return console.error('Could not get key', err);

                document.getElementById('bridge-key').value = key;
            });
    var ip = Homey.get('constellation-bridge-ip', function(err, ip){ 
                if( err ) return console.error('Could not get ip', err);

                document.getElementById('bridge-ip').value = ip;
            });
}

//Save the settings
function save() {
    Homey.set('constellation-bridge-key', document.getElementById('bridge-key').value);
    Homey.set('constellation-bridge-ip', document.getElementById('bridge-ip').value);
    messageIn("Succesfully saved");
}

//Animation for the 'saved' message
function messageIn(message) {
    $message = $('#message');
    $message.removeClass("active");
    $message.delay("1").addClass("active");
    $message.html(message);
}

//Test if the information supplied is correct
function testConnection() {
    
    var ip = $("#bridge-ip").val();
    var key = $("#bridge-key").val();
    
    $.ajax({
       url: "http://"+ip+"/api/"+key+"/scenes",
       error: function(data) {
          $("#test-connection").removeClass("orange");
          $("#test-connection").addClass("red");
       },
       dataType: "json",
       complete: function(data) {
          if (data.responseJSON[0] !== undefined) {
              if (data.responseJSON[0].error !== undefined) {
                  $("#test-connection").removeClass("orange");
                  $("#test-connection").removeClass("green");
                  $("#test-connection").addClass("red");
              }
          } 
          else {
              $("#test-connection").removeClass("orange");
              $("#test-connection").addClass("green");
          }
       },
       type: 'GET'
    });
}