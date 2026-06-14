CPP = g++
OFLAG = -Wall -o
LFLAG = -l
IFLAG = -I
LIBFLAG = -L
LIBDIR = /usr/local/lib/
INCLUDEDIR = /usr/local/include/
DEBUGF = -g -D DEBUG
DEBUG = no

.SUFFIXES: .exe .cpp
.cpp.exe:
        $(CPP) $(OFLAG) $@ $<
    $@

main.exe: main.cpp
	$(CPP) $(IFLAG) $(INCLUDEDIR) $(OFLAG) boost.exe main.cpp $(LIBFLAG)$(LIBDIR) $(LFLAG)libboost_regex