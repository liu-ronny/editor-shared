export default abstract class AlternativesPanel {
    abstract logo(): string;

    html(): string {
        return `
<div class="alternatives-panel hidden">
  <div class="success-color-placeholder"></div>
  <div class="error-color-placeholder"></div>
  <div class="alternatives-logo-container">
    <div class="alternatives-logo">${this.logo()}</div>
    <div class="hidden listening-indicator"></div>
    <div class="spacer"></div>
    <div class="alternatives-status"></div>
  </div>
  <div class="alternatives-login-container">
    <div class="alternatives-pre-login-buttons">
      <button class="btn btn-pre-login">Log in to Serenade</button>
      <button class="btn btn-pre-register">Sign up for Serenade</button>
      <a href="#" class="btn-pre-skip">Skip for now ${this.spinner()}</a>
    </div>
    <div class="alternatives-login hidden">
      <div class="login-error hidden"></div>
      <form class="alternatives-login-form">
        ${this.login()}
      </form>
    </div>
    <div class="alternatives-register hidden">
      <div class="login-error hidden"></div>
      <form class="alternatives-register-form">
        ${this.register()}
      </form>
    </div>
  </div>
  <div class="alternatives-volume-container hidden">
    <div class="alternatives-listen-controls">
      <button class="btn btn-listen" disabled>Listen</button>
      <button class="btn btn-menu">
      <i class="fas fa-chevron-down"></i>
      <div class="menu-dropdown hidden">
        <a href="#" class="btn-clear">Clear</a>
        <a href="#" class="btn-guide">Guide</a>
        <a href="#" class="btn-reference">Reference</a>
      </div>
    </div>
    </button>
    <div class="alternatives-bar-container">
      <div class="alternatives-bar success-color-4"></div>
    </div>
  </div>
  <div class="nux hidden">
    <div class="nux-progress success-color-4"></div>
    <h2 class="nux-heading"></h2>
    <div class="nux-body"></div>
    <button class="btn btn-nux-back hidden">&lsaquo; Back</button>
    <button class="btn btn-nux-next">Next &rsaquo;</button>
  </div>
  <div class="alternatives-list-container hidden">
    <div class="alternatives-valid">
      <div class="alternatives-valid-header"></div>
      <div class="alternatives-valid-list"></div>
    </div>
    <div class="alternatives-invalid">
      <div class="alternatives-invalid-header"></div>
      <div class="alternatives-invalid-list"></div>
    </div>
  </div>
</div>
        `;
    }

    login(): string {
        return `
<input type="text" class="input-login-email" placeholder="Email" />
<input type="password" class="input-login-password" placeholder="Password" />
<button class="btn btn-login">
    Log in to Serenade ${this.spinner()}
</button>
<a href="#" class="btn-login-alt btn-pre-register">Or sign up for an account</a>
        `;
    }

    register(): string {
        return `
<input type="text" class="input-register-name" placeholder="Full name" />
<input type="text" class="input-register-email" placeholder="Email" />
<input type="password" class="input-register-password" placeholder="Password" />
<button class="btn btn-register">
    Sign up for Serenade ${this.spinner()}
</button>
        `;
    }

    spinner(): string {
        return `<div class="lds-ring hidden"><div></div><div></div><div></div><div></div></div>`;
    }
}
