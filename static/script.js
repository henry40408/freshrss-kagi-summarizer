(function () {
  var KagiStatus = {
    INITIAL_LOADED: 0,
    LOADING: 1,
    ERROR: 2,
  };

  if (document.readyState && document.readyState !== "loading") {
    configureSummarizeButtons();
  } else {
    document.addEventListener(
      "DOMContentLoaded",
      configureSummarizeButtons,
      false,
    );
  }

  function configureSummarizeButtons() {
    document.getElementById("global").addEventListener(
      "click",
      function (e) {
        for (
          var target = e.target;
          target && target !== this;
          target = target.parentNode
        ) {
          if (target.matches(".kagi-summary a.btn")) {
            e.preventDefault();
            e.stopPropagation();
            if (target.href) {
              summarizeButtonClick(target);
            }
            break;
          }
        }
      },
      false,
    );
  }

  function setKagiState(container, statusType, statusMsg, summaryText) {
    var kstatus = container.querySelector(".kagi-status");
    var content = container.querySelector(".kagi-content");

    switch (statusType) {
      case KagiStatus.INITIAL_LOADED:
        container.classList.remove("kagi-loading");
        kstatus.classList.remove("alert-warn");
        kstatus.classList.remove("alert-error");
        kstatus.classList.add("hidden");
        kstatus.innerHTML = "";
        break;
      case KagiStatus.LOADING:
        container.classList.add("kagi-loading");
        kstatus.classList.remove("alert-error");
        kstatus.classList.add("alert-warn");
        kstatus.innerHTML = statusMsg;
        kstatus.classList.remove("hidden");
        break;
      case KagiStatus.ERROR:
        container.classList.remove("kagi-loading");
        kstatus.classList.remove("alert-warn");
        kstatus.classList.add("alert-error");
        kstatus.innerHTML = statusMsg;
        break;
    }

    if (summaryText) {
      content.innerHTML = summaryText.replace(/(?:\r\n|\r|\n)/g, "<br>");
      content.classList.remove("hidden");
    } else {
      content.classList.add("hidden");
      content.innerHTML = "";
    }
  }

  function summarizeButtonClick(button) {
    var container = button.parentNode;
    if (container.classList.contains("kagi-loading")) {
      return;
    }

    setKagiState(
      container,
      KagiStatus.LOADING,
      kagi_strings.loading_summary,
      null,
    );

    var url = button.href;
    var request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.responseType = "json";

    request.onload = function (e) {
      if (this.status != 200) {
        return request.onerror(e);
      }

      var xresp = xmlHttpRequestJson(this);
      if (!xresp) {
        return request.onerror(e);
      }

      if (
        xresp.status !== 200 ||
        !xresp.response ||
        !xresp.response.output_text
      ) {
        return request.onerror(e);
      }

      if (xresp.response.error) {
        setKagiState(
          container,
          KagiStatus.ERROR,
          xresp.response.output_text,
          null,
        );
      } else {
        setKagiState(
          container,
          KagiStatus.INITIAL_LOADED,
          null,
          xresp.response.output_text,
        );
      }
    };

    request.onerror = function (e) {
      badAjax(this.status == 403);
      setKagiState(container, 2, kagi_strings.error, null);
    };

    request.setRequestHeader("Content-Type", "application/json");
    request.send(
      JSON.stringify({
        ajax: true,
        _csrf: context.csrf,
      }),
    );
  }
})();
