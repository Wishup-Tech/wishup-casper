<style>
  .kg-button-card a.kg-btn-accent{
    background: #1A66B8 !important;
}
    #table_of_contents,#right-side-fixed-div{
		/* height:400px;
        overflow-y:scroll !important; */
      display: none !important;
    }
    #phone {
      margin-left:30px !important;
}
    .content-new{
		margin-top:0 !important;
	}
    figure.article-image{
		display:none;
	}
    .gh-portal-powered{
        display : none !important;
    }
    
    .gh-content p{
    	margin-top : 20px;
    }
    @media only screen and (max-width: 600px) {
          #phone {
      margin-left : 30px !important;
}
          .gh-head-brand .gh-head-logo.no-image
            {
                width: 250px;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 16px !important;
            }
    }
  
    html{
		zoom:1;
    }
    .post-card-excerpt{
		-webkit-line-clamp: initial !important;
	}
    
    .post-card-large .post-card-image{
    	overflow:hidden !important;
    }
    
    .post-card-large{
    	padding:40px 20px;
    }
    
    .post-card-image-link{
		overflow:hidden !important;
	}
</style>

<script type="text/javascript">
    (function (e, t, o, n, p, r, i) {
      e.visitorGlobalObjectAlias = n;
      e[e.visitorGlobalObjectAlias] =
        e[e.visitorGlobalObjectAlias] ||
        function () {
          (e[e.visitorGlobalObjectAlias].q =
            e[e.visitorGlobalObjectAlias].q || []).push(arguments);
        };
      e[e.visitorGlobalObjectAlias].l = new Date().getTime();
      r = t.createElement("script");
      r.src = o;
      r.async = true;
      i = t.getElementsByTagName("script")[0];
      i.parentNode.insertBefore(r, i);
    })(
      window,
      document,
      "https://diffuser-cdn.app-us1.com/diffuser/diffuser.js",
      "vgo"
    );
    vgo("setAccount", "1001590348");
    vgo("setTrackByDefault", true);
  
    vgo("process");
  </script>
  <script
    type="text/javascript"
    src="https://apiv2.popupsmart.com/api/Bundle/394778"
    async
  ></script>
  
  <script>
document.addEventListener("DOMContentLoaded", () => {
      function if_blog_detail_page() {
        // console.log('Check if blog detail page')
      let windowPathname = window.location.pathname;
      if (windowPathname[windowPathname.length - 1] == "/") {
        windowPathname = windowPathname.slice(0, -1);
      }
  
      const parts = windowPathname.split("/");
  
      if (parts.length > 2) {
        //Url - /blog
        return true;
      }
  
      return false;
    }
  
    let sidebarsCreated = false;
    let form_in_mobile = false ;
    let profiles_loaded = false ;
  
    function scroll_to_h2(index) {
                    // console.log('scroll to h2');
  
      let h2s = document.getElementsByTagName("h2");
      let element = h2s[index];
      element.scrollIntoView({ behavior: "smooth" });
    }
  
    function sidebars() {
              // console.log('sidebar');
  
      document.body.insertAdjacentHTML(
        "beforeend",
        `<style> * {overflow:initial !important}</style>`
      );
  
      let y = `
      <div id="right-side-fixed-div1" style="z-index:1000; right:20px; top:32px;height:600px;position:sticky">
          <div style="width:354px;font-weight: 500;font-size: 20px;line-height: 28px;color: #171E27;">Schedule a free consultation with Wishup</div>
          <iframe id="lead-form-iframe2" style="width: 100%; height: 600px; border: 0;" src="https://www.wishup.co/lead-form?sourceUrl=${window.location.href}"></iframe>
      </div>
  
      `;
  
      let z = ` `;
  
      let h2s = document.getElementsByTagName("h2");
  
      for (let i = 0; i < h2s.length; i++) {
        h2s[i].style.scrollMargin = "100px";
        if (h2s[i].innerHTML.includes("People Also ") || h2s[i].innerHTML.includes("Sign up ") ) {
          break;
        }
        z =
          z +
          `<div class="table_of_content_text ${
            i == 1 ? "active" : ""
          } " onclick="scroll_to_h2(${i})"  style="cursor:pointer;border-left: 2px none;border-radius: 3px;padding: 8px;font-weight: 400;font-size: 16px;line-height: 20px;" > ${
            h2s[i].innerText
          } </div>`;
      }
      let x = `
      <div id="right-side-fixed-div"  style="z-index:1000; right:20px; top:500px;height:400px;position:sticky; top:32px">
          <div style="width:300px;font-weight: 500;font-size: 20px;line-height: 28px;color: #171E27;">Contents</div>
          <div id="table_of_contents">
              ${z}
          </div>
      </div>
  
      `;
  
      let div_left = `<div style="width:300px;margin-left: 20px;display:none;">
              ${x}
          </div>`;
  
      let div_right = `
          <div class="sticky-form" style="margin-right: 20px;">
              ${y}
          </div>`;
      if (window.innerWidth <= 1400) {
        div_left = "";
      }
      document.querySelector("main").style.padding = 0;
      let content = document.querySelector(".site-main .article .gh-content");
        // console.log('-----',content);
      //document.querySelector(".site-main article").style.position = "relative";
      //document.querySelector(".site-main article .post").style.width ="800px";
      //document.querySelector(".site-main article").style.overflow = "scroll";
      content.style.margin = "auto";
      content.style.display = "flex";
      content.style.justifyContent = "center";
      content.style.gap = "20px";
      content.style.maxWidth = "1366px";
      content.innerHTML = "<div>"+content.innerHTML+"</div>"
	  content.innerHTML = div_left + "<div class='content-new' style='padding-left:32px;padding-right:32px'>"+content.innerHTML+"</div>" + div_right;
      document
        .querySelectorAll("img")
        .forEach((x) => (x.style.maxWidth = "100%"));
  
        sidebarsCreated = true ;
    }
  
    function form_after_h2(after_which_position) {
              // console.log('form after h2');
  
      let h2s = document.getElementsByTagName("h2");
      let element = h2s[after_which_position + 1];
      let y = `
      <div id="right-side-fixed-div" style="z-index:1000; right:20px; top:100px;width:354px;height:580px;margin:auto">
          <div style="width:354px;font-weight: 500;font-size: 20px;line-height: 28px;color: #171E27;">Schedule a free consultation with Wishup</div>
          <iframe id="lead-form-iframe2" style="width: 100%; height:542px; border: 0;" src="https://www.wishup.co/lead-form?sourceUrl=${window.location.href}"></iframe>
      </div>
  
      `;
      element.innerHTML = y + element.innerHTML;
      form_in_mobile= true;
    }
  
    function profiles_after_h2(after_which_position) {
        // console.log('profiles after h2');
      window.addEventListener("message", function (event) {
        // console.log("Message received from the child: " + event.data.redirectURL); // Message received from child
        window.open("https://www.wishup.co" + event.data.redirectURL, "_blank");
      });
  
      let h2s = document.getElementsByTagName("h2");
      let element = h2s[after_which_position + 1];
        console.log('Element to be put profiles before',element);
      let y = `
      <div id="right-side-fixed-div" style="z-index:1000; right:0px; top:100px;width:100%;height:660px;margin:auto">
          <iframe id="lead-form-iframe2" style="width: 100%; height:660px; border: 0;" src="https://www.wishup.co/profiles?sourceUrl=${window.location.href}"></iframe>
      </div>
  
      `;
      element.innerHTML = y + element.innerHTML;
      profiles_loaded = true ;
    }
      
      
     // view port height
     const totalScrollHeight = document.documentElement.scrollHeight;
    function getScrollDepth() {
      const windowHeight = window.innerHeight ;
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop; // Current scroll position
  
    // Calculate the scroll depth as a percentage
    const scrollDepth = (currentScrollPosition + windowHeight) / totalScrollHeight;
  
    return scrollDepth;
  }
      
  async function fetchGeoLocation(){
    // Check if the result is already stored in the browser's cache
    const cachedGeoLocation = localStorage.getItem("geoLocation");
    if (cachedGeoLocation) {
      return cachedGeoLocation;
    }
  
    // Sends a GET request to Cloudflare's API and waits for the response
    let response = await fetch("https://www.cloudflare.com/cdn-cgi/trace");
    
    // Extracts the response text and waits for it to resolve
    let responseText = await response.text();
    
    // Cleans up the response text by replacing newlines and equal signs with JSON-compatible formatting
    let data = responseText.replace(/[\r\n]+/g, '","').replace(/\=+/g, '":"');
    
    // Converts the cleaned-up response data into a JSON object
    data = '{"' + data.slice(0, data.lastIndexOf('","')) + '"}';
    var locale = await JSON.parse(data);
    
    // Store the result in the browser's cache
    localStorage.setItem("geoLocation", locale.loc.toLowerCase());
    
    // Returns the user's location as a lowercase string
    return locale.loc.toLowerCase();
  }    
  
      
    window.addEventListener(
      "scroll",
      async function () {
        const scrollDepth = getScrollDepth();
  
        const thresholdHeight = (window.innerHeight + 300) / totalScrollHeight;
        // view port height
        // console.log(`scroll depth : ${scrollDepth} >>> threshold ${thresholdHeight}`);
        // Use the updated scroll depth value as needed
        let geo_location = await fetchGeoLocation();
        const alwaysTrue = true;
         // console.log(geo_location);
        if (['us', 'ca', 'gb', 'uk', 'au', 'il', 'ae', 'qa', 'sa'].includes(geo_location)) {
          if (
            window.innerWidth > 1000 &&
            scrollDepth >= thresholdHeight &&
            !sidebarsCreated
          ) {
            sidebars();
          } else if (
            if_blog_detail_page() &&
            window.innerWidth < 767 &&
            scrollDepth >= thresholdHeight &&
            !form_in_mobile
          ) {
            form_after_h2(2);
          }
  
          if (
            if_blog_detail_page() &&
            window.innerWidth >= 767 &&
            scrollDepth >= thresholdHeight &&
            !profiles_loaded
          ) {
            profiles_after_h2(0);
          }
        }else{
          if (
            window.innerWidth > 1000 &&
            scrollDepth >= thresholdHeight &&
            !sidebarsCreated
          ) {
            sidebars();
          }
        } 
      },
      { passive: true }
    );
  
});

   

 
     </script>
  