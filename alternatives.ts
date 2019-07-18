import * as nux from './nux';
import * as suggestions from './suggestions';

export default abstract class Alternatives {
    abstract addComputedStyleElement(element: HTMLElement): void;
    abstract getLoginFields(): {email: string, password: string};
    abstract getRegisterFields(): {name: string, email: string, password: string};
    abstract getState(key: string): any;
    abstract sendIPC(message: string, data: {[key: string]: any}): void;
    abstract setState(key: string, value: any): void;
    abstract setupLoginEvents(): void;
    abstract setupRegisterEvents(): void;
    abstract showDocsPanel(url: string): void;

    $(e: string): HTMLElement|null {
        return document.querySelector(e);
    }

    $$(e: string): NodeListOf<Element> {
        return document.querySelectorAll(e);
    }

    alternativeRows(alternatives: any[], options: {validOnly?: boolean, invalidOnly?: boolean, truncate?: number}) {
        let index = 1;
        return alternatives
            .map(e => {
                // for invalid commands, show an X rather than a number
                let rowClass = '';
                let n = index.toString();
                if (e.sequences && e.sequences.length === 1 && e.sequences[0].commands &&
                    e.sequences[0].commands.length === 1 &&
                    e.sequences[0].commands[0].type === 'COMMAND_TYPE_INVALID') {
                    n = '&times';
                    rowClass = 'invalid';
                    if (options.validOnly) {
                        return null;
                    }
                }
                else {
                    index++;
                    if (options.invalidOnly) {
                        return null;
                    }
                }

                // replace code markup with appropriate HTML
                let newline = e.sequences.some(
                    (s: any) => s.commands.some((c: any) => c.type === 'COMMAND_TYPE_SNIPPET_EXECUTED')
                );
                let description = e.description.replace(/<code>([\s\S]+)<\/code>/g, (_s: any, m: string) => {
                    if (m.includes('\n') || newline) {
                        newline = true;
                        return `<div class="alternative-code"><pre>${this.escapeText(m)}</pre></div>`;
                    }
                    else {
                        if (options && options.truncate) {
                            m = this.truncate(m, options.truncate);
                        }

                        return ` <pre class="inline">${this.escapeText(m)}</pre>`;
                    }
                });

                return `
    <a class="alternative-row ${rowClass} ${newline ? 'has-newline' : ''}" data-index="${n}">
        <div class="alternative-row-inner">
            <div class="alternative-number">
                <div class="alternative-number-inner">${n}</div>
            </div>
            <div class="alternative-description">${description}</div>
        </div>
    </a>`;
            })
            .filter(e => e !== null);
    }

    escapeText(s: string): string {
        if (!s) {
            return s;
        }

        return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    initialize() {
        // show login form
        this.$('.btn-pre-login')!.addEventListener('click', () => {
            this.$('.alternatives-login')!.classList.remove('hidden');
            this.$('.alternatives-register')!.classList.add('hidden');
            this.$('.alternatives-pre-login-buttons')!.classList.add('hidden');
        });

        // show register form
        this.$$('.btn-pre-register').forEach(e => {
            e.addEventListener('click', () => {
                this.$('.alternatives-register')!.classList.remove('hidden');
                this.$('.alternatives-login')!.classList.add('hidden');
                this.$('.alternatives-pre-login-buttons')!.classList.add('hidden');
            });
        });

        // toggle dropdown on dropdown button click
        this.$('.btn-menu')!.addEventListener('click', () => {
            this.$('.btn-menu i')!.classList.toggle('active');
            let $dropdown = this.$('.menu-dropdown')!;
            if ($dropdown.classList.contains('active')) {
                $dropdown.classList.toggle('active');
                setTimeout(() => {
                    $dropdown!.classList.add('hidden');
                }, 200);
            }
            else {
                $dropdown.classList.remove('hidden');
                setTimeout(() => {
                    $dropdown.classList.toggle('active');
                }, 1);
            }
        });

        // toggle listening state (managed by client) on listen button click
        this.$('.btn-listen')!.addEventListener('click', () => {
            this.setState('listening', !this.getState('listening'));
        });

        // show guide panel
        this.$('.btn-guide')!.addEventListener('click', () => {
            this.showDocsPanel('https://docs.serenade.ai');
        });

        // show reference panel
        this.$('.btn-reference')!.addEventListener('click', () => {
            this.showDocsPanel('https://docs.serenade.ai/docs/reference.html');
        });

        // send clear command on clear button click
        this.$('.btn-clear')!.addEventListener('click', () => {
            this.sendIPC('SEND_TEXT', {text: 'cancel'});
        });

        // send use command on alternative click
        this.$('.alternatives-valid-list')!.addEventListener('click', e => {
            const $row = (e.target as HTMLElement).closest('.alternative-row')!;
            if ($row.classList.contains('suggestion')) {
                return;
            }

            const index = $row.getAttribute('data-index');
            this.sendIPC('SEND_TEXT', {text: `use ${index}`});
        });

        this.$('.alternatives-valid-list')!.addEventListener('mouseover', (e: any) => {
            const $row = e.target.closest('.alternative-row');
            if ($row != null) {
                $row.classList.add('success-color-light');
            }
        });

        this.$('.alternatives-valid-list')!.addEventListener('mouseout', (e: any) => {
            const $row = e.target.closest('.alternative-row');
            if ($row != null && !$row.classList.contains('highlighted')) {
                $row.classList.remove('success-color-light');
            }
        });

        this.setupLoginEvents();
        this.setupRegisterEvents();

        // vscode supplies theme variables via CSS4 variables, which aren't compatible with SCSS color functions (yet).
        // some are supplied as hex values, and others are supplied as RGB triples, so we can't rely on parsing those.
        // so, we create elements with the desired colors, use getComputedStyle to return RGB, and manually perform
        // the color manipulations. this is kind of crazy.
        const rgbSuccess: any =
            ((getComputedStyle(this.$('.success-color')!) as any)['background-color'] as string).match(/\d+/g);
        this.$('.success-color')!.style.display = 'none';

        let style = document.createElement('style');
        this.addComputedStyleElement(style);
        (style.sheet as CSSStyleSheet)
            .insertRule(
                `.success-color-light { background: rgba(${rgbSuccess[0]}, ${rgbSuccess[1]}, ${rgbSuccess[2]}, 0.4); }`,
                0
            );
    }

    login() {
        this.$('.btn-login .lds-ring')!.classList.remove('hidden');
        this.$('.btn-login')!.setAttribute('disabled', 'true');

        this.sendIPC('AUTHENTICATE', this.getLoginFields());
    }

    onAlternatives(data: any, previous: any) {
        // show alternatives if specified
        if ('alternatives' in data) {
            let header = '';
            if (data.alternatives.length === 0) {
                if (data.alternativeType === 'files') {
                    header = 'No matching files found';
                }
            }
            else if (data.alternatives.length > 1) {
                header = 'Did you mean';
            }

            const validRows = this.alternativeRows(
                data.alternatives, {truncate: data.alternativeType === 'files' ? 50 : undefined, validOnly: true}
            );

            const $valid = this.$('.alternatives-valid')!;
            if (validRows.length > 0) {
                $valid.classList.remove('hidden');
                this.$('.alternatives-valid-header')!.innerHTML =
                    data.alternativeType === 'files' ? 'Select a file' : 'Select a command';
                this.$('.alternatives-valid-list')!.innerHTML = validRows.join('');
            }
            else {
                $valid.classList.add('hidden');
            }

            const invalidRows = this.alternativeRows(data.alternatives, {invalidOnly: true});
            const $invalid = this.$('.alternatives-invalid')!;
            if (invalidRows.length > 0) {
                $invalid.classList.remove('hidden');
                this.$('.alternatives-invalid-header')!.innerHTML = 'Invalid commands';
                this.$('.alternatives-invalid-list')!.innerHTML = invalidRows.join('');
            }
            else {
                $invalid.classList.add('hidden');
            }
        }

        // show suggestions if there aren't any alternatives
        else if (data.suggestions || !previous || (previous && 'alternatives' in previous)) {
            const completed = this.getState('nuxCompleted');
            this.$('.alternatives-valid')!.classList.remove('hidden');
            this.$('.alternatives-valid-header')!.innerHTML = completed ? 'Try saying' : '';
            this.$('.alternatives-valid-list')!.innerHTML = completed ? suggestions.random(5) : '';

            this.$('.alternatives-invalid')!.classList.add('hidden');
            this.$('.alternatives-invalid-header')!.innerHTML = '';
            this.$('.alternatives-invalid-list')!.innerHTML = '';
        }
    }

    onAppState(state: string, _previous: string) {
        this.$('.alternatives-panel')!.classList.remove('hidden');
        const $login = this.$('.alternatives-login-container');
        const $volume = this.$('.alternatives-volume-container');
        const $list = this.$('.alternatives-list-container');
        const $nux = this.$('.nux');

        if (state === 'LOADING') {
            $login!.classList.add('hidden');
            $volume!.classList.add('hidden');
            $list!.classList.add('hidden');
            $nux!.classList.add('hidden');
        }
        else if (state === 'LOGIN_FORM') {
            $login!.classList.remove('hidden');
            $volume!.classList.add('hidden');
            $list!.classList.add('hidden');
            $nux!.classList.add('hidden');
            this.$('.alternatives-status')!.innerHTML = '';
        }
        else if (state === 'READY') {
            $login!.classList.add('hidden');
            $volume!.classList.remove('hidden');
            $list!.classList.remove('hidden');
            this.setState('status', 'Paused');

            if (!this.getState('nuxCompleted')) {
                $nux!.classList.remove('hidden');
            }
        }
    }

    onHighlighted(index: number, _previous: number) {
        const alternatives = this.getState('alternatives');
        if (!('alternatives' in alternatives)) {
            return;
        }

        const rows = this.$$('.alternatives-valid-list .alternative-row:not(.invalid)');
        if (index < rows.length) {
            this.$('.alternatives-valid-header')!.innerHTML = 'Ran command';
            rows[index].classList.add('success-color-light');
            rows[index].classList.add('highlighted');
        }
    }

    onListening(on: boolean, _previous: boolean) {
        this.$('.btn-listen')!.innerHTML = on ? 'Pause' : 'Listen';
        if (on) {
            this.$('.listening-indicator')!.classList.remove('hidden');
        }
        else {
            this.$('.listening-indicator')!.classList.add('hidden');
        }
    }

    onLoading(on: boolean, _previous: boolean) {
        if (on) {
            this.$('.alternatives-valid-header')!.innerHTML =
                '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>Loading...';
        }
    }

    onLoginError(error: string, _previous: boolean) {
        this.$('.btn-login')!.removeAttribute('disabled');
        this.$('.btn-login .lds-ring')!.classList.add('hidden');
        this.$('.btn-register')!.removeAttribute('disabled');
        this.$('.btn-register .lds-ring')!.classList.add('hidden');

        this.$$('.login-error').forEach(e => {
            e.classList.remove('hidden');
            e.innerHTML = error;
        });
    }

    onNuxCompleted(completed: boolean, _previous: boolean) {
        if (completed) {
            this.$('.nux')!.classList.add('hidden');
            return;
        }

        this.setState('nuxStep', 0);
        this.$('.nux')!.classList.remove('hidden');
        this.$('.btn-nux-next')!.addEventListener('click', () => {
            const stepIndex = this.getState('nuxStep');
            if (stepIndex < nux.steps().length - 1) {
                this.setState('nuxStep', stepIndex + 1);
            }
            else {
                this.setState('nuxCompleted', true);
                this.setState('alternatives', {suggestions: true});
            }
        });

        this.$('.btn-nux-back')!.addEventListener('click', () => {
            const stepIndex = this.getState('nuxStep');
            if (stepIndex > 0) {
                this.setState('nuxStep', stepIndex - 1);
            }
        });
    }

    onNuxStep(stepIndex: number, _previous: number) {
        const steps = nux.steps();
        const step = steps[stepIndex];
        this.$('.btn-nux-next')!.innerHTML = stepIndex === steps.length - 1 ? 'Close' : 'Next &rsaquo;';
        this.$('.nux-progress')!.style.width = Math.ceil((stepIndex / (steps.length - 1)) * 100) + '%';
        this.$('.nux-heading')!.innerHTML = step.title;
        this.$('.nux-body')!.innerHTML = step.body;

        const $back = this.$('.btn-nux-back')!;
        if (stepIndex == 0) {
            $back.classList.add('hidden');
        }
        else {
            $back.classList.remove('hidden');
        }
    }

    onStatus(text: string, _previous: string) {
        this.$('.alternatives-status')!.innerHTML = text;
    }

    onVolume(volume: number, _previous: number) {
        this.$('.alternatives-bar')!.style.width = (volume || 0) + '%';
    }

    register() {
        this.$('.btn-register .lds-ring')!.classList.remove('hidden');
        this.$('.btn-register')!.setAttribute('disabled', 'true');

        this.sendIPC('REGISTER', this.getRegisterFields());
    }

    truncate(text: string, size: number): string {
        if (text.length <= size) {
            return text;
        }

        size -= '...'.length;
        size = Math.floor(size / 2);
        return text.substr(0, size) + '...' + text.substr(text.length - size);
    }
}
