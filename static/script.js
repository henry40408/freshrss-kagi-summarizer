if (document.readyState && document.readyState !== 'loading') {
  configureSummarizeButtons();
} else {
  document.addEventListener('DOMContentLoaded', configureSummarizeButtons, false);
}

function configureSummarizeButtons() {
  document.getElementById('global').addEventListener('click', function(e) {
    for (var target = e.target; target && target != this; target = target.parentNode) {
      if (target.matches('.kagi-summary a.btn')) {
        e.preventDefault();
        e.stopPropagation();
        if (target.href) {
          summarizeButtonClick(target);
        }
        break;
      }
    }
  }, false);
}

function summarizeButtonClick(button) {
  var url = button.href;
  var loadingMsg = button.dataset.loading;
  var errorMsg = button.dataset.error;
  var container = button.parentNode;

  container.classList.add('alert');
  container.classList.add('alert-warn');
  container.innerHTML = loadingMsg;

  var request = new XMLHttpRequest();
  request.open('POST', url, true);
  request.responseType = 'json';

  request.onload = function(e) {
    if (this.status != 200) {
      return request.onerror(e);
    }

    var response = xmlHttpRequestJson(this);
    if (!response) {
      return request.onerror(e);
    }

    if (response.status !== 200 || !response.response || !response.response.output_text) {
      return request.onerror(e);
    }

    if (response.response.error) {
      container.classList.remove('alert-warn');
      container.classList.add('alert-error');
    } else {
      container.classList.remove('alert-warn');
      container.classList.add('alert-success');
    }

    container.innerHTML = response.response.output_text;
  }

  request.onerror = function(e) {
    badAjax(this.status == 403);
    container.classList.remove('alert-warn');
    container.classList.add('alert-error');
    container.innerHTML = errorMsg;
  }

  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({
    ajax: true,
    _csrf: context.csrf
  }));
}
