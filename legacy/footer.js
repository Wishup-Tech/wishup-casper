<!-- <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "ekc75kgkmm");
    
 

</script> -->
<script src="https://cdn.jsdelivr.net/gh/wishupdev/jsDelivr/AppDownloadBanner/ak.js"></script>
<script src="//embed.typeform.com/next/embed.js"></script>
<style>
    #announcement-bar-root{
        cursor : pointer ;
    }
    .author-profile-image{
		overflow : hidden !important;
	}
    .post-full-content h5{
		width:initial !important;
	}
    .site-header {
        background: #15171a !important;
    }

    .iti__country-list {
        min-width: 200px;
    }

    .ui.form {
        padding: 24px;
    }

    @media only screen and (min-width: 600px) {
        #lead_modal {
            width: 50%;
        }
    }

    #lead_modal .ui.button,
    .ui.buttons .button,
    .ui.buttons .or,
    #lead_modal .ui.form,
    #sucess_popup.ui.modal>.content,
    #sucess_popup .ui.button,
    .ui.buttons .button,
    .ui.buttons .or {
        font-size: 1.3rem;
    }

    #lead_modal h4 {
        text-align: center;
    }

    .grecaptcha-badge {
        display: none !important;
    }

    #lead_modal,
    #sucess_popup {
        display: none;
    }

    .modal-title {
        font-family: 'Inter' !important;
        font-style: normal;
        font-weight: 600;
        font-size: 23.04px;
        color: #1466B8;
    }

    .modal-subtitle {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 500;
        font-size: 19.2px;
        line-height: 24px;
        margin-top: 8px;

        /* Greys/60 */

        color: #999999 !important;
    }

    .modal-label {
        font-family: 'Inter' !important;
        font-style: normal !important;
        font-weight: 600 !important;
        font-size: 16px !important;
        line-height: 24px !important;
        /* Blues/40 */
        margin-bottom: 0px;
        color: #1466B8 !important;

    }

    .modal-input {
        border-top: none !important;
        border-left: none !important;
        border-right: none !important;
        border-radius: 0px !important;
        padding: 10px 0px !important;
        font-size: 16px !important;
    }

    ::-webkit-input-placeholder {
        /* Edge */
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        color: #999999;
    }

    :-ms-input-placeholder {
        /* Internet Explorer 10-11 */
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        color: #999999;
    }

    ::placeholder {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 24px;
        color: #999999;
    }

    .cta-button {
        padding: 12px 25px;

        width: 221px;
        height: 48px;

        /* Blues/40 */

        background: #1466B8;
        color: white !important;
        /* Button_Shadow */
        outline: none;
        border: none !important;
        box-shadow: 0px 4px 10px 0.5px rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        cursor: pointer;
    }

    #phone {
        padding-left: 50px !important;
    }

    .iti__country-list {
        font-size: 16px !important;
    }

    .cta-button2 {
        background-color: #1466B8;
        z-index: 99;
        color: #fff;
        border: 1px solid transparent;
        border-radius: 6px;
        min-height: 41px;
        line-height: 41px;
        font-size: 19px;
        font-weight: 500;
        padding: 0px 20px;
        text-align: center;
    }

    .hire-btn.fixed {
        top: 71px;
    }

    .only-in-mobile {
        display: none;
        background: white;
        padding: 10px;
    }
    .flex-grow{
        flex-grow: 1;
      
    }
    .w-100{
        width:100%
    }
    .cursor-pointer{
        cursor: pointer;
    }


    /* On screens that are 992px or less, set the background color to blue */
    @media all and (max-width: 600px) {
        .only-in-mobile {
            z-index: 99999;
            display: flex;
            justify-content: center;
            position: fixed;
            bottom: 0px;
            gap:10px;
            left: 0px;
            width: 100%;
            text-align: center;
            border-top: 1px solid #e4e4e4;
        }
      
    }
</style>

<div class="only-in-mobile">
    <a href="https://app.wishup.co/hire" class="flex-grow cursor-pointer" ><button class="cta-button2 w-100 cursor-pointer" type="submit">  Hire Now </button></a>
    <button onclick="show_popup()" class="cta-button2 flex-grow cursor-pointer" type="submit">Free Consultation</button>
</div>
<div class="ui mini modal" id='sucess_popup'>
    <div class="content">
        <p>Request consultation has been made.</p>
    </div>
    <div class="actions">
        <div class="ui black deny button">
            Okay
        </div>
    </div>
</div>

<div class="ui modal" style="border-radius:6px;padding:1em; position:relative" id='lead_modal'>
    <i onclick="close_modal()" style="position:absolute; right:10px;top:10px; color:#b2b2b2; font-size:20px; cursor:pointer" class="x icon"></i>
    <h3 style="text-align: center;" class="modal-title">Looking to build a remote team?
        <h4 class="modal-subtitle" id="modalHeader">Get free consultation</h4>
        <p style="text-align:center;font-size:1.2rem;"> Virtual Assistants | Software Testers | Bookkeepers </p>
    </h3>

    <form class="ui form" id='lead_popup' action=' https://www.wishup.co/submit_lead' method='post'>
        <div class="two fields">
            <div class="field">
                <label class="modal-label">First Name</label>
                <input class="modal-input" type="text" name="first_name" placeholder="First Name" required>
            </div>
            <div class="field">
                <label class="modal-label">Last Name</label>
                <input class="modal-input" type="text" name="last_name" placeholder="Last Name" required>
            </div>
        </div>
        <div class="two fields">
            <div class="field">
                <label class="modal-label">Email</label>
                <input class="modal-input" type="email" name="email" placeholder="Email" required>
            </div>
            <div class="field">
                <label class="modal-label">Phone</label>
                <input class="modal-input" type="tel" id="phone" name="phone" placeholder="Phone" style="padding-left:80px">
            </div>
        </div>
        <br>
        <div class="actions" style="display: flex; justify-content: center;">
            <button type='submit' id="modalButton" class="cta-button" data-sitekey="6LflOb8bAAAAAHCoLq7QdG2YZiiSnMetrJ_NMzrW" data-callback='onSubmit'>
                Get Free Consultation
            </button>
        </div>

        <p style="text-align:center;color:'grey';"><sup>*</sup> Valid for new signups only </p>

    </form>
</div>


<script src="https://code.jquery.com/jquery-3.1.1.min.js" integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"></script>



<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/components/modal.min.css" integrity="sha512-TZcDC1wfg+AqGtM4mMMEyxg0/0thWnoWG3ImpDAbpZ0kuUnxB6i3mVDOFaI5Ps9DXF+s85e0o/pGQmQvzJrqlQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/components/button.min.css" integrity="sha512-M7rg5ZHWYZjr0GnXEViJ8Q8v8827mu2jxklF6D2s2qF6D3EtK1KorI/5pvX3HbwX+5xS3k1QiWctTfwpt87+Bg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/components/icon.min.css" integrity="sha512-sk1iEFuVIHvDq5m4/mjF/JbMs8n6bGy08/moX0kwpbFmdsf1PxahyZtx7WbCnlnRVzQUMjD/XwcUMqVWFQ2Obg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/components/dimmer.min.css" integrity="sha512-2QVbSeMIbrRBsnijAHthDB9i9CcGyTrjiV39i/LhD66Vd7dWolav8t+AW0buf6zTJrKc5QQFiaN1QfO2BwQdOQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/components/transition.min.css" integrity="sha512-fAWJ9hkCj1xQEin4gNmfFVigO7aONaY5DIF1FChzujXeraXIWTLGjV09a4Fvkj0WrR9atbcL6ihpira5txF0KA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/components/form.min.css" integrity="sha512-R0nYQYFFnS6AlhDaKH6tkhCUzup9C89J+Ka07q5PYUyn2m96ehdKKswT1gE+vxEtxRc6IiHi+SuKhSkH0yerPA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/components/header.min.css" integrity="sha512-9NfGU8KUNK4tF+S+C1I4VZUisHsD1DA7DEtqZGt2HxsK47ZHwwCklLqw4cx6NTxJBSSvMuYu0CDwiNTJJJschw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/components/input.min.css" integrity="sha512-lkfC9AJ6sWhQhFajQ0ZGwTMeV/yMnLf1cDB+PN6xu4NuT4QdySe/mPUTUgyI6QgKKzxk9UjEyMBv9M1PSzwzWQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/components/form.js" integrity="sha512-y26Q9YJBETi/ATORUmY30kY1nH9U2gQHCDZU6OeygeTzq57iC8Tc/0peeUjIAeEcLqfvH/B5Vq37BxicojP+8g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/components/transition.min.js" integrity="sha512-NjLUWlqKkCoO2RF8nf/gwYHmHyTIkXxqWCMB8lP8UsTfwXRArYLHZVB0JAiSO4yApW1LXya8/O7yHIC6kZbE1w==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/components/dimmer.min.js" integrity="sha512-MOvLbfoN+2ScvWy4tHJ0Q4vI8JIWfJ5LTQcwHEXSfTTI8LJpVeecpTz1iqki7A8YczFTqhbeeUQKfc97EUKp2A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/components/modal.min.js" integrity="sha512-ARiv7k5kXWwrB/diyaaZg4Bt+iFSRUFdBbPl29/NUoCD+jbFTGs6po/jF2Xd2uCHSSMH8gBJWQRseYWJxZ8jaQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.16/js/intlTelInput.min.js" integrity="sha512-Po9nSdYOcWIcoADdRjkAbRYPpR8OHjxzA/3RDUERZcDewTLzRTxbG4bUX7Sr7lVEcO3wTCzphdOBWgNFKVmxaA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.16/css/intlTelInput.css" integrity="sha512-gxWow8Mo6q6pLa1XH/CcH8JyiSDEtiwJV78E+D+QP0EVasFs8wKXq16G8CLD4CJ2SnonHr4Lm/yY2fSI2+cbmw==" crossorigin="anonymous" referrerpolicy="no-referrer" />

<style>
    .iti.iti--allow-dropdown,
    .iti.iti--allow-dropdown {
        width: 100%;
    }
    .gh-powered-by .gh-portal-powered{
        display : none !important;
    }
</style>

<script>
  var country_code;
$(document).ready(function () {
    $.ajax({
        url: "https://app.wishup.co/api/public/voucher",
        headers: { secret: 'a509b3344c68d9835f75efg21h156i9j' },
        success: function (res) {
            $("#modalHeader").html(`${res.voucher_desc} on your first month of service`)
            $("#modalButton").html(`Free Consultation <br /> (Claim Your $ ${res.voucher_amount} voucher)`)
        }
    });

    var input = document.querySelector("#phone");
    var iti = intlTelInput(input, {
        initialCountry: "auto",
        separateDialCode: true,
        geoIpLookup: function (success, failure) {
            $.get("https://ipinfo.io", function () {}, "jsonp").always(function (resp) {
                var countryCode = (resp && resp.country) ? resp.country : "us";
                country_code = countryCode;
                console.log(country_code);
                let country_data = window.intlTelInputGlobals.getCountryData();
                let dial_code = country_data.find(c => c.iso2 === countryCode.toLowerCase()).dialCode;
                success(countryCode);
                setTimeout(() => {
                    iti.setNumber('+' + dial_code + ' ');
                }, 2000);
            });
        },
    });
});
</script>



<script async src="https://www.googletagmanager.com/gtag/js?id=G-4VJZTFPF5B"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-4VJZTFPF5B');
</script>


<script defer type="text/javascript">


    function show_popup() {
        $('#lead_modal').modal('show');
    }
    function close_modal() {
        console.log('Close Modal Called')
        $('#lead_modal').modal('hide')
    }

    (function () {
        function validateEmail(email) {
            const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
        if(window.innerWidth<767)
        setTimeout(function () {
            console.log('Pop Up Opened')
            $('#lead_modal').css("display", "block");

            /* document.body.style.top1 = `-${window.scrollY}px`; */
            $('#lead_modal').modal({

                onHide: function () {
                    const scrollY = document.body.style.top1;
                    /*
                    setTimeout(function () {
                        window.scroll(0, parseInt(scrollY || '0') * -1);
                    }, 400);
                    */

                },
                onApprove: function () {
                    var valid = $('#lead_popup')[0].first_name.value && $('#lead_popup')[0].last_name.value && $('#lead_popup')[0].email.value;

                    if (valid) {
                        setTimeout(function () {
                            $('.mini.modal').modal('show');
                        }, 1000);
                    } else {
                        return false;
                    }
                }
            }).modal('show');

        }, 15 * 1000);
    })();

    $(function () {
        $('#lead_popup').submit(function () {
            event.preventDefault();
            onSubmit()
        });
    })
    function onSubmit(token) {
        console.log('token:')
        console.log(token)
        var data = {
            first_name: $('#lead_popup')[0].first_name.value,
            last_name: $('#lead_popup')[0].last_name.value,
            country_code : (country_code || '').toLowerCase(),
            email: $('#lead_popup')[0].email.value, phone: $('#lead_popup')[0].phone.value
        }


        var valid = $('#lead_popup')[0].first_name.value && $('#lead_popup')[0].last_name.value && $('#lead_popup')[0].email.value;
        console.log('data:')
        console.log(data)

        console.log('valid:')
        console.log(valid)
        if (valid) {
            $.ajax({
                type: 'POST',
                url: 'https://app.wishup.co/api/public/lead/create',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(data)
            });



            $('#lead_modal').modal('hide')
            $('#sucess_popup').css("display", "block");
            setTimeout(function () {
                $('.mini.modal').modal('show');
            }, 1000);
            // ga('send', {
            //     hitType: 'event',
            //     eventCategory: 'Lead',
            //     eventAction: 'client_lead_submitted',
            //     eventLabel: data.email
            // });

           if(['+1', '+44'].indexOf(data.phone.split(' ')[0]) > -1){
                //only tg countries
                
                gtag('event', 'client_lead_submitted', {send_to: 'G-4VJZTFPF5B'})
                gtag('event', 'client_lead_submitted', {send_to: 'UA-64278748-3'})
           }
          
        }
        

    }       
</script>
<script>
  document.addEventListener("DOMContentLoaded", function () {
    // Wait a bit to ensure Ghost has rendered the post content
    setTimeout(function () {
      document.querySelectorAll(".open-consultation-modal").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (typeof show_popup === "function") {
            show_popup();
          } else {
            console.error("show_popup function is not defined");
          }
        });
      });
    }, 500); // 500ms delay to ensure DOM is fully loaded
  });
</script>

<!-- 🔄 Dynamic Lead Form Modal -->
<div id="leadFormModal" style="
  display: none;
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6);
  justify-content: center;
  align-items: center;
">
  <div style="
    background-color: #fff;
    padding: 0;
    border-radius: 10px;
    width: 350px;
    height: 445px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    position: relative;
  ">
    <!-- Close Button -->
    <span onclick="closeLeadFormModal()" 
      style="
        position: absolute;
        top: 10px;
        right: 16px;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        z-index: 10;
      ">&times;</span>

    <!-- Dynamic Iframe -->
    <iframe 
      id="leadFormIframe"
      src=""
      style="width: 100%; height: 100%; border: none; border-radius: 10px;"
      title="Lead Form"
      loading="lazy">
    </iframe>
  </div>
</div>

<script>
  function openLeadFormModal(leadFormSlug = "default-lead-form") {
    const iframe = document.getElementById("leadFormIframe");
    iframe.src = `https://www.wishup.co/lead-form?leadForm=${leadFormSlug}`;
    document.getElementById("leadFormModal").style.display = "flex";
  }

  function closeLeadFormModal() {
    document.getElementById("leadFormModal").style.display = "none";
    document.getElementById("leadFormIframe").src = ""; // optional: clear to reset state
  }
</script>
