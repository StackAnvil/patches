// SPDX-License-Identifier: GPL-3.0-or-later
#include <hb.h>

#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

namespace {
struct Bytes {
    std::vector<char> data;
    Bytes &u16(int value) {
        const auto bits = static_cast<uint16_t>(value);
        data.push_back(static_cast<char>(bits >> 8));
        data.push_back(static_cast<char>(bits & 255));
        return *this;
    }
    Bytes &u32(uint32_t value) { return u16(value >> 16).u16(value & 65535); }
    Bytes &tag(const char *value) {
        data.insert(data.end(), value, value + 4);
        return *this;
    }
    Bytes &append(const Bytes &other) {
        data.insert(data.end(), other.data.begin(), other.data.end());
        return *this;
    }
};

// An authored two-glyph layout fixture. It contains no game fonts or captured tables.
struct Fixture {
    Bytes gpos, gdef, fvar;

    Fixture(int base, int mark, bool variation = false) {
        Bytes scripts;
        scripts.u16(1).tag("DFLT").u16(8)
            .u16(4).u16(0) // Script: default language only.
            .u16(0).u16(65535).u16(1).u16(0);
        Bytes features;
        features.u16(1).tag("mark").u16(8).u16(0).u16(1).u16(0);
        Bytes subtable;
        subtable.u16(1).u16(12).u16(18).u16(1).u16(24).u16(36)
            .u16(1).u16(1).u16(2) // Mark coverage: glyph 2.
            .u16(1).u16(1).u16(1) // Base coverage: glyph 1.
            .u16(1).u16(0).u16(6).u16(1).u16(mark).u16(mark)
            .u16(1).u16(4);
        if (variation) {
            // Format 3 anchor: X variation device, no Y device.
            subtable.u16(3).u16(base).u16(base).u16(10).u16(0)
                .u16(0).u16(0).u16(0x8000);
            gdef.u32(0x00010003).u16(0).u16(0).u16(0).u16(0).u16(0).u32(18)
                .u16(1).u32(12).u16(1).u32(22) // ItemVariationStore.
                .u16(1).u16(1).u16(0).u16(0).u16(0) // Constant region.
                .u16(1).u16(1).u16(1).u16(0).u16(3); // One delta of 3 design units.
            fvar.u32(0x00010000).u16(16).u16(2).u16(1).u16(20).u16(0).u16(8)
                .tag("wght").u32(100u << 16).u32(400u << 16).u32(900u << 16)
                .u16(0).u16(256);
        } else {
            subtable.u16(1).u16(base).u16(base);
        }
        Bytes lookups;
        lookups.u16(1).u16(4).u16(4).u16(0).u16(1).u16(8).append(subtable);
        gpos.u32(0x00010000).u16(10).u16(10 + scripts.data.size())
            .u16(10 + scripts.data.size() + features.data.size())
            .append(scripts).append(features).append(lookups);
    }
};

hb_blob_t *table(hb_face_t *, hb_tag_t tag, void *data) {
    const auto &fixture = *static_cast<Fixture *>(data);
    const Bytes *bytes = tag == HB_TAG('G', 'P', 'O', 'S') ? &fixture.gpos
        : tag == HB_TAG('G', 'D', 'E', 'F') ? &fixture.gdef
        : tag == HB_TAG('f', 'v', 'a', 'r') ? &fixture.fvar : nullptr;
    return bytes && !bytes->data.empty()
        ? hb_blob_create(bytes->data.data(), static_cast<unsigned>(bytes->data.size()),
            HB_MEMORY_MODE_DUPLICATE, nullptr, nullptr)
        : hb_blob_get_empty();
}

hb_bool_t nominal(hb_font_t *, void *, hb_codepoint_t character, hb_codepoint_t *glyph, void *) {
    *glyph = character == 'a' ? 1 : character == 0x301 ? 2 : 0;
    return *glyph != 0;
}

hb_position_t advance(hb_font_t *, void *, hb_codepoint_t glyph, void *) {
    return glyph == 1 ? 500 : 0;
}

void shape(const std::string &name, Fixture &fixture, int expected_x, int expected_y,
           bool explicit_zero_coordinate = false) {
    hb_face_t *face = hb_face_create_for_tables(table, &fixture, nullptr);
    hb_face_set_upem(face, 1000);
    hb_face_set_glyph_count(face, 3);
    hb_font_t *font = hb_font_create(face);
    hb_font_set_scale(font, 500, 500);
    hb_font_funcs_t *functions = hb_font_funcs_create();
    hb_font_funcs_set_nominal_glyph_func(functions, nominal, nullptr, nullptr);
    hb_font_funcs_set_glyph_h_advance_func(functions, advance, nullptr, nullptr);
    hb_font_set_funcs(font, functions, nullptr, nullptr);
    hb_font_funcs_destroy(functions);
    if (explicit_zero_coordinate) {
        const int coordinate = 0;
        hb_font_set_var_coords_normalized(font, &coordinate, 1);
    }
    hb_buffer_t *buffer = hb_buffer_create();
    hb_buffer_add_utf8(buffer, "a\xcc\x81", -1, 0, -1);
    hb_buffer_guess_segment_properties(buffer);
    hb_shape(font, buffer, nullptr, 0);
    unsigned count = 0;
    const hb_glyph_info_t *glyphs = hb_buffer_get_glyph_infos(buffer, &count);
    const hb_glyph_position_t *positions = hb_buffer_get_glyph_positions(buffer, nullptr);
    const bool matched = count == 2 && glyphs[0].codepoint == 1 && glyphs[1].codepoint == 2
        && positions[0].x_advance == 500 && positions[1].x_advance == 0
        && positions[1].x_offset == expected_x && positions[1].y_offset == expected_y;
    if (!matched) {
        std::cerr << name << ": expected mark offset " << expected_x << "," << expected_y;
        if (count == 2) std::cerr << "; got " << positions[1].x_offset << "," << positions[1].y_offset;
        std::cerr << "; glyph count " << count << '\n';
    }
    hb_buffer_destroy(buffer);
    hb_font_destroy(font);
    hb_face_destroy(face);
    if (!matched) throw std::runtime_error(name);
}
} // namespace

int main() {
    Fixture positive(1, 2), negative(-1, -2), mixed(1, -1), variable(0, 0, true);
    struct Case {
        const char *name;
        Fixture *fixture;
        int x, y;
        bool zero_coordinate;
    };
    const Case cases[] = {
        {"positive anchors round separately", &positive, -500, 0, false},
        {"negative half anchors round away from zero", &negative, -500, 0, false},
        {"opposite-sign anchors retain both rounded positions", &mixed, -498, 2, false},
        {"default variable font retains absent coordinates", &variable, -500, 0, false},
        {"explicit zero coordinates admit constant variation delta", &variable, -499, 0, true},
    };
    unsigned failures = 0;
    for (const auto &control : cases) {
        try { shape(control.name, *control.fixture, control.x, control.y, control.zero_coordinate); }
        catch (const std::exception &) { failures++; }
    }
    if (failures) std::cerr << failures << " OreUI shaping controls failed\n";
    else std::cout << "OreUI shaping controls passed\n";
    return failures ? 1 : 0;
}
