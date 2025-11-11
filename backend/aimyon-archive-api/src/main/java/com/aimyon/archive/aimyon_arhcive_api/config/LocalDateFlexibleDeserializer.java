package com.aimyon.archive.aimyon_arhcive_api.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Accepts either YYYY-MM-DD or YYYYMMDD strings for LocalDate fields.
 */
public class LocalDateFlexibleDeserializer extends JsonDeserializer<LocalDate> {
    private static final DateTimeFormatter DASHED = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter COMPACT = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Override
    public LocalDate deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getValueAsString();
        if (text == null) return null;
        text = text.trim();
        if (text.isEmpty()) return null;
        // Try dashed first, then compact
        try {
            if (text.length() == 10 && text.charAt(4) == '-' && text.charAt(7) == '-') {
                return LocalDate.parse(text, DASHED);
            }
            if (text.length() == 8) {
                return LocalDate.parse(text, COMPACT);
            }
            // Fallback to default parser (may handle other valid formats)
            return LocalDate.parse(text);
        } catch (DateTimeParseException ex) {
            throw InvalidFormatException.from(p, "Invalid date format; expected YYYY-MM-DD or YYYYMMDD", text, LocalDate.class);
        }
    }
}

