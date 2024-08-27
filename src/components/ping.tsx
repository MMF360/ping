import React, { useEffect, useState } from 'react';
import "../css/ping.css";

interface Ping {
  hs_object_id: string;
  name: string;
  next_available_price: string;
  next_available_date_formatted: string;
  ping_custom_link: string;
  notification_form_id: string;
  themeColor: string;
  themeFont: string;
  ping_preview_image: string;
  ping_product_name: string;
  displayType: string;
  displayPosition: string;
  previewText: string;
}

interface HostDetails {
  host_brand_name: string;
  host_brand_logo_file: boolean;
  host_brand_logo_url: string;
  themeColor: string;
  themeFont: string;
  displayType: string;
  displayPosition: string;
  previewText: string;
}

const PingWidget: React.FC = () => {
  const [listingId, setListingId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [allPings, setAllPings] = useState<Ping[]>([]);
  const [allPingsObjIds, setAllPingsObjIds] = useState<string[]>([]);
  const [hostDetails, setHostDetails] = useState<HostDetails | null>(null);
  const [currProp, setCurrProp] = useState<string | null>(null);
  const [previewTextRemoved, setPreviewTextRemoved] = useState(false);
  const [previewMode, setPreviewMode] = useState(true); // Change this to false if needed
  const [pingData, setPingData] = useState<Ping | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('listing');
    const ownerId = urlParams.get('owner');

    setListingId(listingId);
    setOwnerId(ownerId);

    if (!previewMode) {
      const pageUrl = window.location !== window.parent.location ? document.referrer : document.location.href;
      fetch(`https://staywatch.ai/_hcms/api/analytics/ping/db/view?listingId=${listingId}&pageUrl=${pageUrl}`);
    }

    if (listingId) {
      getPingData(listingId);
    } else if (ownerId) {
      getOwnerPingsData(ownerId);
    } else {
      alert("No listing or owner ID provided");
    }
  }, [previewMode]);

  const setRootStyles = (color: string, font: string) => {
    const root = document.documentElement;
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = `https://fonts.googleapis.com/css?family=${font}`;
    document.body.appendChild(fontLink);
    root.style.setProperty('--font', font || 'Satoshi');
    root.style.setProperty('--color', `#${color}`);
  };

  const resetForm = (ping: Ping | false, formId: string) => {
    const pingInstructions = document.getElementById('ping__instructions');
    if (pingInstructions) pingInstructions.classList.remove('hide');

    window.addEventListener('message', event => {
      if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
        const notificationFormReset = document.getElementById('ping__form-reset');
        if (notificationFormReset) notificationFormReset.style.display = 'inline-block';

        notificationFormReset?.addEventListener('click', () => {
          if (ping) {
            renderPingForm(ping);
          } else {
            renderMasterPingForm(hostDetails);
          }
        }, false);

        pingInstructions?.classList.add('hide');
      }
    });
  };

  const renderPingForm = (ping: Ping) => {
    const target = document.getElementById('ping__shell-target');
    const pingFormMarkup = `
      <div class="ping__card-top" style="background-image: linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.45)), url(${ping.ping_preview_image}); background-size: cover; background-position: center;"></div>
      <div id="ping__form" class="ping__form">
        <button id="ping__backToProp" class="ping__back"></button>
        <p id="ping__instructions"><strong>Get notified if this stay becomes available during your preferred travel dates!</strong></p>
        <div id="ping__form-inner"></div>
        <p><a class='ping__card-btn' id='ping__form-reset'>Submit Another Request</a></p>
      </div>
    `;
    if (target) {
      target.innerHTML = "";
      target.insertAdjacentHTML("beforeend", pingFormMarkup);
    }
    resetForm(ping, ping.notification_form_id);
  };

  const renderMasterPingForm = (hostDetails: HostDetails | null) => {
    if (!hostDetails) return;
    const target = document.getElementById('ping__shell-target');
    const pingFormMarkup = `
      <div id="ping__masterForm" class="ping__form">
        <button id="ping__backToPropList" class="ping__back"></button>
        ${hostDetails.host_brand_logo_url ? `<img src="${hostDetails.host_brand_logo_url}" alt="${hostDetails.host_brand_name} logo" style="max-width: 200px; margin: 0px auto 20px auto;display: block;">` : ''}
        <p id="ping__instructions"><strong>Get notified if any properties in our portfolio become available during your preferred travel dates!</strong></p>
        <div id="ping__form-inner"></div>
        <p><a class='ping__card-btn' id='ping__form-reset'>Submit Another Request</a></p>
      </div>
    `;
    if (target) {
      target.innerHTML = "";
      target.insertAdjacentHTML("beforeend", pingFormMarkup);
    }
    resetForm(false, `b441d827-6cfd-481c-b242-63cf8cbd16a1`);
  };

  const getPingData = (id: string) => {
    fetch(`https://staywatch.ai/_hcms/api/ping/listing-v2/listing`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify({
        hsListingId: id,
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data) {
        const pingItem = data.CRM.p_listings;
        setCurrProp(pingItem.hs_object_id);
        setAllPings([pingItem]);
        setPingData(createPingObj(pingItem));
      }
    })
    .catch((error) => {
      alert(error);
    });
  };

  const getOwnerPingsData = (id: string) => {
    fetch(`https://staywatch.ai/_hcms/api/ping/multi-listings/listings`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify({
        contactId: id,
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data) {
        setHostDetails(createHostDetailsObj(data.CRM.contact));
        const pings = data.CRM.contact.associations.p_listings_collection__ping_owner.items;
        setAllPings(pings);
        setAllPingsObjIds(extractPingObjIds(pings));
      }
    })
    .catch((error) => {
      alert(error);
    });
  };

  const createPingObj = (firstPing: any): Ping => {
    return {
      hs_object_id: firstPing.hs_object_id || "",
      name: firstPing.name,
      next_available_price: firstPing.next_available_price || 'Unavailable',
      next_available_date_formatted: firstPing.next_available_date_formatted || 'Unavailable',
      ping_custom_link: firstPing.ping_custom_link || '',
      notification_form_id: firstPing.notification_form_id,
      themeColor: firstPing.ping_embed_code_theme_color || '5071fd',
      themeFont: firstPing.ping_embed_code_font ? firstPing.ping_embed_code_font.value : 'Roboto',
      ping_preview_image: firstPing.ping_preview_image || '',
      ping_product_name: firstPing.ping_product_name || 'Ping Starter',
      displayType: firstPing.ping_embed_code_display_type ? firstPing.ping_embed_code_display_type.value : 'chatbot',
      displayPosition: firstPing.ping_embed_code_display_position ? firstPing.ping_embed_code_display_position.value : 'bottom-right',
      previewText: firstPing.ping_embed_code_preview_text || 'Get notified if this listing becomes available during your preferred travel dates!',
    };
  };

  const createHostDetailsObj = (hostDetails: any): HostDetails => {
    return {
      host_brand_name: hostDetails.host_brand_name || 'Choose a Property',
      host_brand_logo_file: hostDetails.host_brand_logo_file || false,
      host_brand_logo_url: hostDetails.host_brand_logo_url || false,
      themeColor: hostDetails.host_ping_embed_code_theme_color || '5071fd',
      themeFont: hostDetails.host_ping_embed_code_font ? hostDetails.host_ping_embed_code_font.value : 'Roboto',
      displayType: hostDetails.host_ping_embed_code_display_type ? hostDetails.host_ping_embed_code_display_type.value : 'chatbot',
      displayPosition: hostDetails.host_ping_embed_code_display_position ? hostDetails.host_ping_embed_code_display_position.value : 'bottom-right',
      previewText: hostDetails.host_ping_embed_code_preview_text || 'Get notified if any of these properties become available during your preferred travel dates!',
    };
  };

  return (
    <div id="ping__target">
      {/* Render ping widget based on data */}
      {/* Use pingData and allPings state variables for rendering */}
    </div>
  );
};

export default PingWidget;
