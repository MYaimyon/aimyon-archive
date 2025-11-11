// signup.js (UTF-8 safe, no literal \n artifacts)
(function(){
  const M = {
    checkNeeded: "\uC911\uBCF5 \uD655\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
    usernameRequired: "\uC544\uC774\uB514\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
    usernameOk: "\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uC544\uC774\uB514\uC785\uB2C8\uB2E4.",
    usernameUsed: "\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC544\uC774\uB514\uC785\uB2C8\uB2E4.",
    checkFailed: "\uC911\uBCF5 \uD655\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.",
    pwDefault: "8\uC790 \uC774\uC0C1, \uC22B\uC790/\uD2B9\uC218\uBB38\uC790 \uD3EC\uD568 \uAD8C\uC7A5",
    pwOk: "\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uBE44\uBC00\uBC88\uD638\uC785\uB2C8\uB2E4.",
    pwBad: "8\uC790 \uC774\uC0C1, \uC22B\uC790\uC640 \uD2B9\uC218\uBB38\uC790\uB97C \uD3EC\uD568\uD574 \uC8FC\uC138\uC694.",
    pwRules: "\uBE44\uBC00\uBC88\uD638 \uADDC\uCE59\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
    pwMismatch: "\uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2E4.",
    pwEqual: "\uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD569\uB2C8\uB2E4.",
    terms: "\uD544\uC218 \uC57D\uAD00\uC5D0 \uB3D9\uC758\uD574 \uC8FC\uC138\uC694.",
    submitting: "\uAC00\uC785 \uCC98\uB9AC \uC911...",
    success: "\uAC00\uC785\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uBA54\uC778\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4.",
    fail: "\uAC00\uC785\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2E4. \uC785\uB825\uAC12\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694."
  };

  function setStatus(msg, type){
    const el = document.getElementById('signupStatus');
    if(!el) return;
    el.textContent = msg || '';
    el.className = 'compose-status' + (type ? ' ' + type : '');
  }

  document.addEventListener('DOMContentLoaded', init);
  function init(){
    const form = document.getElementById('signupForm');
    const usernameEl = document.getElementById('suUsername');
    const displayEl = document.getElementById('suDisplayName');
    const emailEl = document.getElementById('suEmail');
    const phoneEl = document.getElementById('suPhone');
    const birthEl = document.getElementById('suBirth');
    const pwEl = document.getElementById('suPw');
    const pwConfirmEl = document.getElementById('suPwConfirm');
    const termsEl = document.getElementById('agreeTerms');
    const privacyEl = document.getElementById('agreePrivacy');
    const marketingEl = document.getElementById('agreeMarketing');
    const usernameNote = document.getElementById('usernameNote');
    const passwordNote = document.getElementById('passwordRuleNote');
    const pwMatchNote = document.getElementById('passwordMatchNote');
    const btnCheckUsername = document.getElementById('btnCheckUsername');

    let usernameChecked = false;

    function validatePasswordRules(pw){
      const hasLetter = /[A-Za-z]/.test(pw);
      const hasDigit = /\d/.test(pw);
      const hasSpecial = /[^A-Za-z0-9]/.test(pw);
      return pw.length >= 8 && hasLetter && hasDigit && hasSpecial;
    }

    function updatePasswordNote(){
      if(!passwordNote) return;
      const pw = pwEl.value || '';
      if(!pw){ passwordNote.textContent = M.pwDefault; passwordNote.style.color = 'var(--text-tertiary)'; return; }
      if(validatePasswordRules(pw)) { passwordNote.textContent = M.pwOk; passwordNote.style.color = '#65d26e'; }
      else { passwordNote.textContent = M.pwBad; passwordNote.style.color = '#ff6b6b'; }
    }
    pwEl?.addEventListener('input', updatePasswordNote);

    usernameEl?.addEventListener('input', ()=>{
      usernameChecked = false;
      if(usernameNote){ usernameNote.style.display='none'; usernameNote.textContent = ''; }
    });

    function updatePasswordMatch(){
      if(!pwMatchNote) return;
      const a = pwEl?.value || '';
      const b = pwConfirmEl?.value || '';
      if(!b){ pwMatchNote.style.display='none'; pwMatchNote.textContent=''; return; }
      pwMatchNote.style.display='block';
      if(a === b){ pwMatchNote.textContent = M.pwEqual; pwMatchNote.style.color = '#65d26e'; }
      else { pwMatchNote.textContent = M.pwMismatch; pwMatchNote.style.color = '#ff6b6b'; }
    }
    pwEl?.addEventListener('input', updatePasswordMatch);
    pwConfirmEl?.addEventListener('input', updatePasswordMatch);

    btnCheckUsername?.addEventListener('click', async ()=>{
      const username = (usernameEl.value||'').trim();
      if(!username){ if(usernameNote){ usernameNote.style.display='block'; usernameNote.textContent = M.usernameRequired; usernameNote.style.color = '#ff6b6b'; } return; }
      try{
        const res = await fetch(`/api/auth/check-username?value=${encodeURIComponent(username)}`);
        const data = await res.json();
        usernameChecked = !!data.available;
        if(usernameNote){ usernameNote.style.display='block'; if(usernameChecked){ usernameNote.textContent = M.usernameOk; usernameNote.style.color = '#65d26e'; }
          else { usernameNote.textContent = M.usernameUsed; usernameNote.style.color = '#ff6b6b'; }
        }
      }catch{ if(usernameNote){ usernameNote.style.display='block'; usernameNote.textContent = M.checkFailed; usernameNote.style.color = '#ff6b6b'; } }
    });

    form?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      setStatus('', '');
      const username = (usernameEl.value||'').trim();
      const displayName = (displayEl.value||'').trim();
      const email = (emailEl.value||'').trim();
      const phone = (phoneEl.value||'').trim();
      const birth = birthEl.value || null;
      const password = pwEl.value || '';
      const passwordConfirm = pwConfirmEl.value || '';
      const genderEl = document.querySelector('input[name="suGender"]:checked');
      const gender = genderEl ? genderEl.value : null;

      if(!usernameChecked) return setStatus(M.checkNeeded, 'error');
      if(!validatePasswordRules(password)) return setStatus(M.pwRules, 'error');
      if(password !== passwordConfirm) return setStatus(M.pwMismatch, 'error');
      if(!termsEl.checked || !privacyEl.checked) return setStatus(M.terms, 'error');

      const payload = {
        username, email, password, displayName,
        phoneNumber: phone || null,
        birthDate: birth,
        gender,
        marketingOptIn: !!marketingEl?.checked,
        agreeTerms: !!termsEl?.checked,
        agreePrivacy: !!privacyEl?.checked
      };

      setStatus(M.submitting, '');
      try{
        const res = await fetch('http://localhost:8080/api/auth/register', {
          method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
        });
        if(!res.ok) throw new Error('register failed');
        const data = await res.json();
        if(window.Auth && typeof Auth.set==='function') Auth.set(data);
        setStatus(M.success, 'success');
        setTimeout(()=>{ window.location.href='index.html'; }, 800);
      }catch(err){ console.error(err); setStatus(M.fail, 'error'); }
    });
  }
})();

