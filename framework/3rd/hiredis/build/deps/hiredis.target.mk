# This file is generated by gyp; do not edit.

TOOLSET := target
TARGET := hiredis
DEFS_Debug := \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-DDEBUG' \
	'-D_DEBUG'

# Flags passed to all source files.
CFLAGS_Debug := \
	-fPIC \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-pthread \
	-m64 \
	-g \
	-O0

# Flags passed to only C files.
CFLAGS_C_Debug :=

# Flags passed to only C++ files.
CFLAGS_CC_Debug := \
	-fno-rtti \
	-fno-exceptions

INCS_Debug := \
	-I/data/zyy/framework/3rd/node_modules/hiredis/.node-gyp/0.10.4/src \
	-I/data/zyy/framework/3rd/node_modules/hiredis/.node-gyp/0.10.4/deps/uv/include \
	-I/data/zyy/framework/3rd/node_modules/hiredis/.node-gyp/0.10.4/deps/v8/include

DEFS_Release := \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64'

# Flags passed to all source files.
CFLAGS_Release := \
	-fPIC \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-pthread \
	-m64 \
	-O2 \
	-fno-strict-aliasing \
	-fno-tree-vrp \
	-fno-tree-sink

# Flags passed to only C files.
CFLAGS_C_Release :=

# Flags passed to only C++ files.
CFLAGS_CC_Release := \
	-fno-rtti \
	-fno-exceptions

INCS_Release := \
	-I/data/zyy/framework/3rd/node_modules/hiredis/.node-gyp/0.10.4/src \
	-I/data/zyy/framework/3rd/node_modules/hiredis/.node-gyp/0.10.4/deps/uv/include \
	-I/data/zyy/framework/3rd/node_modules/hiredis/.node-gyp/0.10.4/deps/v8/include

OBJS := \
	$(obj).target/$(TARGET)/deps/hiredis/hiredis.o \
	$(obj).target/$(TARGET)/deps/hiredis/net.o \
	$(obj).target/$(TARGET)/deps/hiredis/sds.o \
	$(obj).target/$(TARGET)/deps/hiredis/async.o

# Add to the list of files we specially track dependencies for.
all_deps += $(OBJS)

# CFLAGS et al overrides must be target-local.
# See "Target-specific Variable Values" in the GNU Make manual.
$(OBJS): TOOLSET := $(TOOLSET)
$(OBJS): GYP_CFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_C_$(BUILDTYPE))
$(OBJS): GYP_CXXFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_CC_$(BUILDTYPE))

# Suffix rules, putting all outputs into $(obj).

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(srcdir)/%.c FORCE_DO_CMD
	@$(call do_cmd,cc,1)

# Try building from generated source, too.

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj).$(TOOLSET)/%.c FORCE_DO_CMD
	@$(call do_cmd,cc,1)

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj)/%.c FORCE_DO_CMD
	@$(call do_cmd,cc,1)

# End of this set of suffix rules
### Rules for final target.
LDFLAGS_Debug := \
	-pthread \
	-rdynamic \
	-m64

LDFLAGS_Release := \
	-pthread \
	-rdynamic \
	-m64

LIBS :=

$(obj).target/deps/hiredis.a: GYP_LDFLAGS := $(LDFLAGS_$(BUILDTYPE))
$(obj).target/deps/hiredis.a: LIBS := $(LIBS)
$(obj).target/deps/hiredis.a: TOOLSET := $(TOOLSET)
$(obj).target/deps/hiredis.a: $(OBJS) FORCE_DO_CMD
	$(call do_cmd,alink)

all_deps += $(obj).target/deps/hiredis.a
# Add target alias
.PHONY: hiredis
hiredis: $(obj).target/deps/hiredis.a

# Add target alias to "all" target.
.PHONY: all
all: hiredis

# Add target alias
.PHONY: hiredis
hiredis: $(builddir)/hiredis.a

# Copy this to the static library output path.
$(builddir)/hiredis.a: TOOLSET := $(TOOLSET)
$(builddir)/hiredis.a: $(obj).target/deps/hiredis.a FORCE_DO_CMD
	$(call do_cmd,copy)

all_deps += $(builddir)/hiredis.a
# Short alias for building this static library.
.PHONY: hiredis.a
hiredis.a: $(obj).target/deps/hiredis.a $(builddir)/hiredis.a

# Add static library to "all" target.
.PHONY: all
all: $(builddir)/hiredis.a

