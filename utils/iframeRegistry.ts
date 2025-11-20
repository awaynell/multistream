/**
 * Глобальный реестр для переиспользования iframe элементов
 * Предотвращает создание дубликатов iframe для одного и того же стримера
 */

interface IframeEntry {
  iframe: HTMLIFrameElement;
  username: string;
  embedUrl: string;
  containers: Set<HTMLElement>; // Все активные контейнеры, использующие этот iframe
}

class IframeRegistry {
  private iframes = new Map<string, IframeEntry>();
  private hiddenContainer: HTMLDivElement | null = null;

  /**
   * Получает или создает скрытый контейнер для хранения неиспользуемых iframe
   */
  private getHiddenContainer(): HTMLDivElement {
    if (!this.hiddenContainer) {
      this.hiddenContainer = document.createElement("div");
      this.hiddenContainer.style.position = "fixed";
      this.hiddenContainer.style.top = "-9999px";
      this.hiddenContainer.style.left = "-9999px";
      this.hiddenContainer.style.width = "1px";
      this.hiddenContainer.style.height = "1px";
      this.hiddenContainer.style.overflow = "hidden";
      this.hiddenContainer.style.pointerEvents = "none";
      this.hiddenContainer.style.opacity = "0";
      document.body.appendChild(this.hiddenContainer);
    }
    return this.hiddenContainer;
  }

  /**
   * Получает или создает iframe для указанного username
   * @param username - Twitch username
   * @param embedUrl - URL для embed
   * @param targetContainer - Контейнер, в который должен быть помещен iframe
   * @returns Существующий или новый iframe элемент
   */
  getOrCreateIframe(
    username: string,
    embedUrl: string,
    targetContainer: HTMLElement | null = null
  ): HTMLIFrameElement {
    const key = username.toLowerCase();

    if (this.iframes.has(key)) {
      const entry = this.iframes.get(key)!;
      // Проверяем, что URL совпадает (на случай изменения параметров)
      if (entry.embedUrl === embedUrl) {
        // Добавляем контейнер в список активных
        if (targetContainer) {
          entry.containers.add(targetContainer);

          // Если iframe находится в скрытом контейнере или в другом контейнере,
          // перемещаем его в целевой контейнер синхронно
          if (entry.iframe.parentNode !== targetContainer) {
            // Удаляем из текущего родителя, если он есть
            if (entry.iframe.parentNode) {
              entry.iframe.parentNode.removeChild(entry.iframe);
            }
            // Добавляем в целевой контейнер
            targetContainer.appendChild(entry.iframe);
          }
        }

        return entry.iframe;
      } else {
        // URL изменился, создаем новый iframe
        this.removeIframe(key);
      }
    }

    // Создаем новый iframe
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.frameBorder = "0";
    iframe.scrolling = "no";
    iframe.allowFullscreen = true;
    iframe.setAttribute("allow", "autoplay; fullscreen");
    iframe.className = "absolute inset-0 h-full w-full";

    const containers = new Set<HTMLElement>();
    if (targetContainer) {
      containers.add(targetContainer);
    }

    this.iframes.set(key, {
      iframe,
      username: key,
      embedUrl,
      containers,
    });

    // Если есть целевой контейнер, добавляем iframe туда
    if (targetContainer) {
      targetContainer.appendChild(iframe);
    }

    return iframe;
  }

  /**
   * Удаляет контейнер из списка активных для указанного username
   * Если остались другие активные контейнеры, перемещает iframe в первый доступный
   * Если активных контейнеров не осталось, перемещает iframe в скрытый контейнер
   * @param username - Twitch username
   * @param container - Контейнер, который больше не используется
   */
  releaseIframe(username: string, container: HTMLElement | null = null): void {
    const key = username.toLowerCase();
    const entry = this.iframes.get(key);

    if (!entry) {
      return;
    }

    // Удаляем контейнер из списка активных
    if (container) {
      entry.containers.delete(container);
    }

    // Если остались активные контейнеры, перемещаем iframe в первый доступный
    if (entry.containers.size > 0) {
      // Находим первый контейнер, который все еще в DOM
      for (const activeContainer of entry.containers) {
        if (activeContainer.isConnected) {
          // Перемещаем iframe в этот контейнер, если он не там уже
          if (entry.iframe.parentNode !== activeContainer) {
            if (entry.iframe.parentNode) {
              entry.iframe.parentNode.removeChild(entry.iframe);
            }
            activeContainer.appendChild(entry.iframe);
          }
          return;
        } else {
          // Контейнер больше не в DOM, удаляем его из списка
          entry.containers.delete(activeContainer);
        }
      }
    }

    // Если активных контейнеров не осталось, перемещаем в скрытый контейнер
    if (
      entry.containers.size === 0 &&
      entry.iframe.parentNode !== this.hiddenContainer
    ) {
      const hiddenContainer = this.getHiddenContainer();
      if (entry.iframe.parentNode) {
        entry.iframe.parentNode.removeChild(entry.iframe);
      }
      hiddenContainer.appendChild(entry.iframe);
    }
  }

  /**
   * Удаляет iframe из реестра
   * @param username - Twitch username
   */
  removeIframe(username: string): void {
    const key = username.toLowerCase();
    const entry = this.iframes.get(key);

    if (entry) {
      // Удаляем iframe из DOM, если он там есть
      if (entry.iframe.parentNode) {
        entry.iframe.parentNode.removeChild(entry.iframe);
      }
      this.iframes.delete(key);
    }
  }

  /**
   * Проверяет, существует ли iframe для указанного username
   */
  hasIframe(username: string): boolean {
    return this.iframes.has(username.toLowerCase());
  }

  /**
   * Получает iframe без увеличения счетчика (для проверки)
   */
  peekIframe(username: string): HTMLIFrameElement | null {
    const entry = this.iframes.get(username.toLowerCase());
    return entry ? entry.iframe : null;
  }

  /**
   * Проверяет, находится ли iframe в скрытом контейнере
   */
  isInHiddenContainer(username: string): boolean {
    const entry = this.iframes.get(username.toLowerCase());
    if (!entry) {
      return false;
    }
    return entry.iframe.parentNode === this.hiddenContainer;
  }

  /**
   * Принудительно перемещает iframe в указанный контейнер
   * Используется для восстановления iframe после потери
   */
  moveToContainer(username: string, container: HTMLElement): boolean {
    const entry = this.iframes.get(username.toLowerCase());
    if (!entry) {
      return false;
    }

    // Добавляем контейнер в список активных
    entry.containers.add(container);

    // Перемещаем iframe
    if (entry.iframe.parentNode !== container) {
      if (entry.iframe.parentNode) {
        entry.iframe.parentNode.removeChild(entry.iframe);
      }
      container.appendChild(entry.iframe);
      return true;
    }

    return false;
  }

  /**
   * Очищает все iframe из реестра
   */
  clear(): void {
    this.iframes.forEach((entry) => {
      if (entry.iframe.parentNode) {
        entry.iframe.parentNode.removeChild(entry.iframe);
      }
    });
    this.iframes.clear();
  }
}

// Singleton экземпляр
export const iframeRegistry = new IframeRegistry();
