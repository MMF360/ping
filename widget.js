(function () {
  const hsCacheBusterNum = Math.floor(1000 + Math.random() * 9000);

  /* Get customizable attributes */
  var listingId = document
    .getElementById("sponstayneousPing")
    .getAttribute("data-id");
  var customColor = document
    .getElementById("sponstayneousPing")
    .getAttribute("data-color");
  var customBgImage = document
    .getElementById("sponstayneousPing")
    .getAttribute("data-bgimage");
  var widgetType = document
    .getElementById("sponstayneousPing")
    .getAttribute("data-type");
  var widgetPos = document
    .getElementById("sponstayneousPing")
    .getAttribute("data-position");
  var widgetFont = document
    .getElementById("sponstayneousPing")
    .getAttribute("data-font");
  var widgetPreviewText = document
    .getElementById("sponstayneousPing")
    .getAttribute("data-previewText");
  var widgetMobileMarginBottom = document
    .getElementById("sponstayneousPing")
    .getAttribute("data-mobileMarginBottom")
    ? document
        .getElementById("sponstayneousPing")
        .getAttribute("data-mobileMarginBottom")
    : false;
  var widgetPreviewTextShowMobile = document
    .getElementById("sponstayneousPing")
    .getAttribute("data-previewTextShowMobile")
    ? document
        .getElementById("sponstayneousPing")
        .getAttribute("data-previewTextShowMobile")
    : true;

  /* Add widget wrapper stylesheet */
  var link = document.createElement("link");
  link.href = `https://sponstayneous.com/hubfs/ping/${widgetType}.css?hsCacheBuster=${hsCacheBusterNum}`;
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);

  /* Search for existing widgets and clear them out */
  var existingWidget = document.getElementById("ping");

  if (existingWidget) {
    existingWidget.remove();
  }

  /* Preview Mode? If so, append widget to preview element */
  var previewMode = document
    .getElementById("sponstayneousPing")
    .getAttribute("data-preview");

  /* Add the iframe */

  var output = `<div type="${widgetType}" id="ping" class="ping__widget-position-${widgetPos}" data-mobileMarginBottom="${widgetMobileMarginBottom}">
                    <iframe frameBorder="0" id="ping__widget-iframe" src="https://sponstayneous.com/hubfs/ping/${widgetType}.html?hsCacheBuster=${hsCacheBusterNum}&listing=${listingId}&color=${customColor}&pos=${widgetPos}&font=${widgetFont}&previewText=${widgetPreviewText}&previewTextShowMobile=${widgetPreviewTextShowMobile}&preview=${previewMode}&hsCacheBuster=${hsCacheBusterNum}">
                  </div>`;

  if (previewMode) {
    var widgetPreviewCodeContainer = document.getElementById(
      "widget-preview__code"
    );
    widgetPreviewCodeContainer.innerHTML = "";
    widgetPreviewCodeContainer.innerHTML = output;
  } else {
    document.body.insertAdjacentHTML("beforeend", output);
  }

  /* Handle change in iFrame size */
  var widgetIframeWrapper = document.getElementById("ping");
  const widgetIframe = document.getElementById("ping__widget-iframe");
  var widgetStatus = "closed";

  function sizeParentIframe(height, width) {
    window.parent.document.querySelector(
      ".widget-html iframe[srcdoc*='sponstayneous']"
    ).style.height = `calc(${height} + 10px`;
    window.parent.document.querySelector(
      ".widget-html iframe[srcdoc*='sponstayneous']"
    ).style.width = `${width}`;
  }

  // Resize the Chatbot type Ping
  function sizeIframe(widgetStatus, height, width) {
    if (widgetStatus == "open" && window.innerWidth < 800) {
      widgetIframeWrapper.style.right = 0;
      widgetIframeWrapper.style.bottom = 0;
      widgetIframeWrapper.style.height = widgetMobileMarginBottom
        ? "calc(100vh - 70px)"
        : "100vh";
      widgetIframeWrapper.style.width = "100%";
    } else {
      widgetIframeWrapper.style.right = "10px";
      widgetIframeWrapper.style.bottom = "10px";
      widgetIframeWrapper.style.height = `${height}`;
      widgetIframeWrapper.style.width = `${width}`;
    }

    if (
      window.parent.document.querySelector(
        ".widget-html iframe[srcdoc*='sponstayneous']"
      )
    ) {
      sizeParentIframe(height, width);
    }
  }

  // Resize Button type Ping
  function sizeButtonIframe(height) {
    widgetIframeWrapper.style.height = `${height}`;
    if (
      window.parent.document.querySelector(
        ".widget-html iframe[srcdoc*='sponstayneous']"
      )
    ) {
      window.parent.document.querySelector(
        ".widget-html iframe[srcdoc*='sponstayneous']"
      ).style.height = `calc(${height} + 10px`;
    }
  }

  // Resize Announcement type Ping
  function sizeAnnouncIframe(height, bg) {
    widgetIframeWrapper.style.height = `${height}`;
    if (
      window.parent.document.querySelector(
        ".widget-html iframe[srcdoc*='sponstayneous']"
      )
    ) {
      window.parent.document.querySelector(
        ".widget-html iframe[srcdoc*='sponstayneous']"
      ).style.height = `calc(${height} + 10px`;
    }
    widgetIframeWrapper.style.backgroundColor = `${bg}`;
  }

  // Listen for Messages from iFrame
  window.addEventListener("message", (event) => {
    if (event.origin.startsWith("https://sponstayneous.com")) {
      // announcement type
      if (event.data.type == "announcement") {
        sizeAnnouncIframe(event.data.widgetHeight, event.data.widgetBg);
      }

      // chatbot type
      else if (event.data.type == "chatbot") {
        if (event.data.action == "resize") {
          widgetIframe.contentWindow.postMessage({
            resize: document.body.clientWidth,
          });
          sizeIframe(null, event.data.widgetHeight, event.data.widgetWidth);
        } else {
          widgetStatus = event.data.action;
          sizeIframe(
            widgetStatus,
            event.data.widgetHeight,
            event.data.widgetWidth
          );
        }
      }

      // button type
      else if (event.data.type == "button") {
        sizeButtonIframe(event.data.widgetHeight);
      }
    }
  });

  window.addEventListener("resize", (event) => {
    widgetIframe.contentWindow.postMessage({
      resize: document.body.clientWidth,
    });
  });
})();
