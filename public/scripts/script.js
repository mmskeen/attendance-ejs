function genPopup() {
  alert("Hello World!");
}

$("#hostMeeting").submit(function(e) {
  e.preventDefault(); // avoid to execute the actual submit of the form.

  var form = $(this);
  var url = form.attr('action');

  $.ajax({
    type: "POST",
    url: url,
    data: form.serialize(), // serializes the form's elements.
    success: function(data) {
      console.log(data);
      if (data['success']) {
        alert("Successfully hosting meeting!\n Code is " + data.code);
      } else {
        alert("Error: " + data.error);
      }
      location.reload(true);
    },
    error : function () {
        alert("Oops! Something went wrong.");
    }
  });
});

$("#attendMeeting").submit(function(e) {
  e.preventDefault(); // avoid to execute the actual submit of the form.

  var form = $(this);
  var url = form.attr('action');

  $.ajax({
    type: "POST",
    url: url,
    data: form.serialize(), // serializes the form's elements.
    success: function(data) {
      console.log(data);
      if (data['success']) {
        alert("Successfully joined meeting: " + data.description + ": " + data.code);
      } else {
        alert("Error: " + data.error);
      }
      location.reload(true);
    },
    error : function () {
        alert("Oops! Something went wrong.");
    }
  });
});
