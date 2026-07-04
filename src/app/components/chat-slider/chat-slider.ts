import { OnInit, AfterViewChecked, Component, ElementRef, OnDestroy, ViewChild, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { SheetService } from '@services/sheet.service';
import { ConfigService } from '@services/config.service';
import { Message } from '@entities/types';
import { IconInjector } from '@directives/icon-injector';

@Component({
  selector: 'app-chat-slider',
  imports: [FormsModule, IconInjector],
  templateUrl: './chat-slider.html'
})
export class ChatSlider implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('inputRef') inputRef!: ElementRef;

  private sheetService = inject(SheetService);
  private http = inject(HttpClient);
  configService = inject(ConfigService);

  constructor() {}

  inputText = '';
  isTyping = signal(false);
  isAIModelsDropdownOpen = signal(false);
  sessionId = 'default';
  selectedModel: any;

  messages = signal<Message[]>([
    { id: 1, text: 'Hey! How can I help you today?', sender: 'bot', time: '9:41 AM', suggestions: ["give me detailed bifurcation of expenses till date"] },
    ]);

  private shouldScroll = false;

  ngOnInit(): void {
    this.selectedModel = {  code: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nvidia/Nemotron-3-Nano' };
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  onEnter(event: any): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.messages.update(msgs => [
      ...msgs,
      { id: Date.now(), text, sender: 'user', time: now, status: 'sent' }
    ]);

    this.inputText = '';
    this.shouldScroll = true;

    // Simulate bot reply
    this.isTyping.set(true);
    this.shouldScroll = true;

    this.getBotReply(text)
      .subscribe({ 
        next: (response) => {
          this.isTyping.set(false);
          this.messages.update(msgs => [
            ...msgs,
            {
              id: Date.now() + 1,
              text: response.response,
              sender: 'bot',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestions: response.suggestions || []
            }
          ]);
          this.shouldScroll = true;
        },
        error: (error) => {
          this.shouldScroll = true;
          if (error.error && error.error.detail)
          this.messages.update(msgs => [
            ...msgs,
            {
              id: Date.now() + 1,
              text: error.error.detail || 'Sorry, something went wrong.',
              sender: 'bot',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestions: []
            }
          ]);
          this.isTyping.set(false);
          this.scrollToBottom();
        }
      });
  }

  private scrollToBottom(): void {
    const el = this.scrollContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
  }

  onSugestionClick(suggestion: string): void {
    this.inputText = suggestion;
    this.send();
  }

  toggleAIModelsDropdown(): void {
    this.isAIModelsDropdownOpen.update(val => !val);
  }

  selectAIModel(model: any): void {
    this.selectedModel = model;
    this.closeAIModelDropdown();
  }

  closeAIModelDropdown(): void {
    this.isAIModelsDropdownOpen.set(false);
  }

  private getBotReply(text: string): Observable<any> {
    const url = this.configService.config.FINANCE_API_URL + '/chat/send';
    const payload = { session_id: this.sessionId, message: text, model_name: this.selectedModel.code, data: this.sheetService.sheetDetails.transactionList || [] };
    return this.http.post(url, payload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      map((res: any) => {
        const response = JSON.parse(res.response) || 'Sorry, I couldn\'t process that.';
        this.sessionId = response.session_id || this.sessionId;
        return response;
      })
    );
  }

  ngOnDestroy(): void {}
}
