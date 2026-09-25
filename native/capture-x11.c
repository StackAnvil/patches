/* SPDX-License-Identifier: GPL-3.0-or-later */
#include <X11/Xatom.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/extensions/XTest.h>
#include <X11/keysym.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void json_string(const char *value) {
    putchar('"');
    for (const unsigned char *p = (const unsigned char *)value; *p; p++) {
        if (*p == '"' || *p == '\\') printf("\\%c", *p);
        else if (*p < 32) printf("\\u%04x", *p);
        else putchar(*p);
    }
    putchar('"');
}

static char *window_title(Display *display, Window window) {
    Atom utf8 = XInternAtom(display, "UTF8_STRING", False);
    Atom name = XInternAtom(display, "_NET_WM_NAME", False);
    Atom actual;
    int format;
    unsigned long count, after;
    unsigned char *data = NULL;
    if (XGetWindowProperty(display, window, name, 0, 1024, False, utf8,
                           &actual, &format, &count, &after, &data) == Success && data) {
        char *copy = strndup((const char *)data, count);
        XFree(data);
        return copy;
    }
    char *legacy = NULL;
    if (XFetchName(display, window, &legacy) && legacy) {
        char *copy = strdup(legacy);
        XFree(legacy);
        return copy;
    }
    return strdup("");
}

static unsigned long pixel_component(unsigned long pixel, unsigned long mask) {
    if (!mask) return 0;
    unsigned int shift = 0;
    while ((mask & 1UL) == 0) { mask >>= 1; shift++; }
    return (((pixel >> shift) & mask) * 255UL) / mask;
}

int main(int argc, char **argv) {
    Display *display = XOpenDisplay(NULL);
    if (!display) { fprintf(stderr, "Cannot open X display\n"); return 1; }
    Window root = DefaultRootWindow(display);
    if (argc == 2 && strcmp(argv[1], "pointer") == 0) {
        Window root_return, child;
        int root_x, root_y, window_x, window_y;
        unsigned int mask;
        if (!XQueryPointer(display, root, &root_return, &child, &root_x, &root_y, &window_x, &window_y, &mask)) return 1;
        printf("%d %d 0x%lx\n", root_x, root_y, child);
    } else if (argc == 2 && strcmp(argv[1], "active") == 0) {
        Atom atom = XInternAtom(display, "_NET_ACTIVE_WINDOW", False);
        Atom actual;
        int format;
        unsigned long count, after;
        unsigned char *data = NULL;
        if (XGetWindowProperty(display, root, atom, 0, 1, False, XA_WINDOW,
                               &actual, &format, &count, &after, &data) == Success && data && count) {
            printf("0x%lx\n", *(Window *)data);
            XFree(data);
        } else {
            Window focused;
            int revert;
            XGetInputFocus(display, &focused, &revert);
            printf("0x%lx\n", focused);
        }
    } else if (argc == 2 && strcmp(argv[1], "list") == 0) {
        Atom clients_atom = XInternAtom(display, "_NET_CLIENT_LIST", False);
        Atom actual;
        int format;
        unsigned long count = 0, after;
        unsigned char *data = NULL;
        if (XGetWindowProperty(display, root, clients_atom, 0, 4096, False, XA_WINDOW,
                               &actual, &format, &count, &after, &data) != Success || !data) {
            Window root_return, parent;
            Window *tree = NULL;
            unsigned int tree_count = 0;
            if (!XQueryTree(display, root, &root_return, &parent, &tree, &tree_count)) return 1;
            data = (unsigned char *)tree;
            count = tree_count;
        }
        Window *children = (Window *)data;
        puts("[");
        int printed = 0;
        for (unsigned long i = 0; i < count; i++) {
            XWindowAttributes attributes;
            if (!XGetWindowAttributes(display, children[i], &attributes) || attributes.map_state != IsViewable) continue;
            char *title = window_title(display, children[i]);
            if (!*title) { free(title); continue; }
            int x, y;
            Window child;
            XTranslateCoordinates(display, children[i], root, 0, 0, &x, &y, &child);
            if (printed++) puts(",");
            printf("{\"id\":\"0x%lx\",\"title\":", children[i]);
            json_string(title);
            printf(",\"x\":%d,\"y\":%d,\"width\":%d,\"height\":%d}", x, y, attributes.width, attributes.height);
            free(title);
        }
        puts("\n]");
        XFree(data);
    } else if (argc >= 3) {
        Window window = (Window)strtoul(argv[2], NULL, 0);
        XWindowAttributes attributes;
        if (!XGetWindowAttributes(display, window, &attributes)) { fprintf(stderr, "Unknown window\n"); return 1; }
        if (strcmp(argv[1], "screenshot") == 0 && argc == 4) {
            XImage *image = XGetImage(display, window, 0, 0, (unsigned)attributes.width, (unsigned)attributes.height, AllPlanes, ZPixmap);
            if (!image) { fprintf(stderr, "Cannot capture window\n"); return 1; }
            FILE *file = fopen(argv[3], "wb");
            if (!file) { perror("screenshot"); return 1; }
            fprintf(file, "P6\n%d %d\n255\n", image->width, image->height);
            for (int y = 0; y < image->height; y++) {
                for (int x = 0; x < image->width; x++) {
                    unsigned long pixel = XGetPixel(image, x, y);
                    fputc((int)pixel_component(pixel, image->red_mask), file);
                    fputc((int)pixel_component(pixel, image->green_mask), file);
                    fputc((int)pixel_component(pixel, image->blue_mask), file);
                }
            }
            fclose(file);
            XDestroyImage(image);
        } else if (strcmp(argv[1], "focus") == 0 && argc == 3) {
            if (getenv("STACKANVIL_UI_ISOLATED")) {
                XRaiseWindow(display, window);
                XSetInputFocus(display, window, RevertToParent, CurrentTime);
            } else {
                XEvent event = { 0 };
                event.xclient.type = ClientMessage;
                event.xclient.window = window;
                event.xclient.message_type = XInternAtom(display, "_NET_ACTIVE_WINDOW", False);
                event.xclient.format = 32;
                event.xclient.data.l[0] = 2;
                event.xclient.data.l[1] = CurrentTime;
                XSendEvent(display, root, False, SubstructureRedirectMask | SubstructureNotifyMask, &event);
            }
            XFlush(display);
        } else if (strcmp(argv[1], "resize") == 0 && argc == 5) {
            int width = atoi(argv[3]), height = atoi(argv[4]);
            if (width < 640 || height < 360 || width > 16384 || height > 16384) {
                fprintf(stderr, "Invalid window size\n"); return 1;
            }
            XResizeWindow(display, window, (unsigned)width, (unsigned)height);
            XFlush(display);
        } else if (strcmp(argv[1], "click") == 0 && argc == 5) {
            int x = atoi(argv[3]), y = atoi(argv[4]);
            if (x < 0 || y < 0 || x >= attributes.width || y >= attributes.height) {
                fprintf(stderr, "Click is outside the window\n"); return 1;
            }
            int root_x, root_y;
            Window child;
            XTranslateCoordinates(display, window, root, x, y, &root_x, &root_y, &child);
            XRaiseWindow(display, window);
            XSetInputFocus(display, window, RevertToParent, CurrentTime);
            XTestFakeMotionEvent(display, DefaultScreen(display), root_x, root_y, CurrentTime);
            XTestFakeButtonEvent(display, 1, True, CurrentTime);
            XTestFakeButtonEvent(display, 1, False, CurrentTime);
            XFlush(display);
        } else if (strcmp(argv[1], "key") == 0 && argc == 4) {
            char *sequence = strdup(argv[3]);
            char *position = NULL;
            KeyCode codes[8];
            int length = 0;
            for (char *part = strtok_r(sequence, "+", &position); part; part = strtok_r(NULL, "+", &position)) {
                const char *name = strcmp(part, "Control") == 0 ? "Control_L"
                    : strcmp(part, "Alt") == 0 ? "Alt_L"
                    : strcmp(part, "Shift") == 0 ? "Shift_L" : part;
                KeyCode code = XKeysymToKeycode(display, XStringToKeysym(name));
                if (!code || length == 8) { fprintf(stderr, "Unknown or excessive key: %s\n", part); free(sequence); return 1; }
                codes[length++] = code;
            }
            free(sequence);
            if (!length) { fprintf(stderr, "No key specified\n"); return 1; }
            XRaiseWindow(display, window);
            XSetInputFocus(display, window, RevertToParent, CurrentTime);
            for (int i = 0; i < length; i++) XTestFakeKeyEvent(display, codes[i], True, CurrentTime);
            for (int i = length - 1; i >= 0; i--) XTestFakeKeyEvent(display, codes[i], False, CurrentTime);
            XFlush(display);
        } else { fprintf(stderr, "Usage: capture-x11 list|screenshot ID FILE|resize ID WIDTH HEIGHT|click ID X Y|key ID NAME\n"); return 2; }
    } else { fprintf(stderr, "Usage: capture-x11 list|screenshot ID FILE|resize ID WIDTH HEIGHT|click ID X Y|key ID NAME\n"); return 2; }
    XCloseDisplay(display);
    return 0;
}
